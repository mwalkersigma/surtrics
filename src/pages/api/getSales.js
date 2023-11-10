
import {isTimeToUpdate} from "../../modules/serverUtils/isTimeToUpdate";
import Logger from "sigma-logger";
import { PromisePool } from '@supercharge/promise-pool'
import db from "../../db/index";
import getLastUpdatedTime from "../../modules/serverUtils/getLastUpdatedTime";
import updateLastUpdatedTime from "../../modules/serverUtils/updateLastUpdatedTime";
function processItems(items) {
    return items
        .map(item => {
            let {sku, quantity,name, unitPrice} = item;
            return {sku, quantity, name, unitPrice};
        })
        .map(item => JSON.stringify(item));
}
function buildURL(base_url, endpoint, options) {
    let url = new URL(base_url + endpoint);
    let temp = JSON.parse(JSON.stringify(options))
    Object.keys(temp).forEach((key) => {
        if (key.toLowerCase().includes('date')) {
            temp[key] = new Date(temp[key]).toISOString().split("T")[0];
        }
        url.searchParams.append(key, temp[key])
    })
    return url
}
async function getShipStationOrders(options) {
    const baseUrl = "https://ssapi.shipstation.com";
    const endpoint = "/orders";
    let results = [];
    while (true) {
        let fullUrl = buildURL(baseUrl, endpoint, options).href;
        console.log(fullUrl);
        let headers ={
            "Authorization": "Basic " + process.env.SHIPSTATION_TOKEN
        }
        let response = await fetch(fullUrl, {
            method: "GET",
            headers: headers
        });
        const {status} = response;
        if(status !== 200) {
            break;
        }
        let data = await response.json();
        const {page,pages,orders} = data;
        results = results.concat(orders);
        if(page === pages) {
            break;
        }
        options.page = page + 1;
        console.log(`Page ${page} of ${pages} retrieved`)
        console.log(`Total orders retrieved: ${results.length}`)
    }
    return results;
}





async function main () {
    try {
        let timeLastUpdated = await getLastUpdatedTime("shipStation");
        let currentTimestamp = new Date().toISOString();
        let shouldNotUpdate = await isTimeToUpdate(currentTimestamp, timeLastUpdated);

        if (shouldNotUpdate) {
            Logger.log("No need to update");
            return;
        }
        Logger.log("Time to update");

        timeLastUpdated = new Date(timeLastUpdated).toISOString().split("T")[0];

        let [newOrders, updatedOrders] = await Promise.all([
            getShipStationOrders({
                pageSize: 500,
                modifyDateStart: timeLastUpdated
            }),
            getShipStationOrders({
                pageSize: 500,
                paymentDateStart: timeLastUpdated
            })
        ])



        console.log("finished getting orders")
        newOrders = newOrders
            .concat(updatedOrders)
            .map((order) => {
                let paymentDate = new Date(order.paymentDate).toISOString();
                let orderId = order.orderId;
                let orderStatus = order.orderStatus;
                let name = order['shipTo'].name.replaceAll("'", "");
                let items = processItems(order.items);
                let storeId = order['advancedOptions'].storeId;
                return JSON.stringify({paymentDate, orderId, orderStatus, items, storeId, name});
            })
        newOrders = [...new Set(newOrders)].map((order) => JSON.parse(order));
        console.log("finished processing orders")

        let queries = [];


        let queryString = `SELECT *
                       FROM surtrics.surplus_sales_data
                       WHERE order_id = $1`;

        console.log("Preparing to query database")
        const {results} = await PromisePool
            .for(newOrders)
            .withConcurrency(25)
            .process(async (order) => {
                const {orderId, orderStatus} = order;
                let {rows} = await db.query(queryString, [orderId]);
                if (rows.length === 0) {
                    let {paymentDate, orderId, orderStatus, name, storeId, items} = order;
                    queries.push([`
                        INSERT INTO 
                            surtrics.surplus_sales_data (payment_date, order_id, order_status, name, store_id, items)
                        VALUES 
                            ($1, $2, $3, $4, $5, ARRAY[$6]);
                        `,[paymentDate, orderId, orderStatus, name, storeId, items]
                        ])
                    console.log("inserting order")
                    return "inserted"
                }
                if (rows.length > 0) {
                    let {order_status} = rows[0];
                    if (order_status !== orderStatus) {
                        queries.push([`UPDATE surtrics.surplus_sales_data SET order_status = '${orderStatus}' WHERE order_id = ${orderId};`])
                        console.log("updating order")
                        return "updated"
                    }
                    console.log("no change")
                    return "no change"
                }
            })

        console.log(results.reduce((acc,curr) => {
            acc[curr] = acc[curr] ? acc[curr] + 1 : 1;
            return acc;
        },{}))

        let {results:queryRows,errors:QueryErrors} = await PromisePool
            .for(queries)
            .withConcurrency(25)
            .process(async (query) => {
                return await db.query(...query);
            })
        console.log(
            JSON.stringify(queryRows),
        )
        console.warn(
            JSON.stringify(QueryErrors)
        )
        console.log("finished inserting into database")
        await updateLastUpdatedTime("shipStation");
    } catch (e) {
        console.log(e);
    }
}

export default function handler (req,res) {
    return main()
        .then(() => {
            res.status(200).send("success");
        })
        .catch((err) => {
            res.status(500).send(err);
        })
}
