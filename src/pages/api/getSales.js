
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
            name = name.replaceAll("'", "");
            return {sku, quantity, name, unitPrice};
        })
        .map(item => JSON.stringify(item));
}
function buildURL(base_url, endpoint, options) {
    let url = new URL(base_url + endpoint);
    let temp = JSON.parse(JSON.stringify(options))
    Object
        .keys(temp)
        .forEach((key) => {
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
        Logger.log(`Retrieving orders from ${fullUrl}`);
        let headers = {
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
        Logger.log(`Page ${page} of ${pages} retrieved`)
        Logger.log(`Total orders retrieved: ${results.length}`)
    }
    return results;
}

async function main () {
    try {
        /*
            Get the latest time stamp from the timeLastUpdated json file.
         */
        let timeLastUpdated = await getLastUpdatedTime("shipStation");
        let currentTimestamp = new Date().toISOString();
        let shouldNotUpdate = await isTimeToUpdate(currentTimestamp, timeLastUpdated);

        if (shouldNotUpdate) {
            Logger.log("No need to update sales");
            return;
        }
        Logger.log("Time to update sales");

        let [newOrders, updatedOrders] = await Promise.all([
            getShipStationOrders({
                pageSize: 500,
                modifyDateStart: timeLastUpdated
            }),
            getShipStationOrders({
                pageSize: 500,
                paymentDateStart: timeLastUpdated
            })
        ]);
        await updateLastUpdatedTime("shipStation");
        Logger.log("Retrieved orders from shipStation: Time last updated: " + timeLastUpdated);
        Logger.log(`Retrieved ${newOrders.length} new orders and ${updatedOrders.length} updated orders`)

        // This is taking in the new orders and the order updates and concating them together.
        // Then it parses the data into the correct format, stringifies it, and then removes duplicates.
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
        Logger.log(`After removing duplicates and cancelled orders, there are ${newOrders.length} new orders to insert`)
        let queries = [];


        let queryString = `SELECT *
                       FROM surtrics.surplus_sales_data
                       WHERE order_id = $1`;

        Logger.log("Preparing to query database")
        const {results} = await PromisePool
            .for(newOrders)
            .withConcurrency(25)
            .process(async (order) => {
                const {orderId, orderStatus} = order;
                let {rows} = await db.query(queryString, [orderId]);
                if (rows.length === 0) {
                    let {paymentDate, orderId, orderStatus, name, storeId, items} = order;
                    console.log(`Inserting order ${orderId} from ${storeId} on ${paymentDate} with status ${orderStatus} for ${name}`);
                    console.log("Items: ", items)
                    queries.push([`
                            INSERT INTO 
                                surtrics.surplus_sales_data (payment_date, order_id, order_status, name, store_id, items) 
                            VALUES ($1, $2, $3, $4, $5, $6::text[])
                            `, [paymentDate, orderId, orderStatus, name, storeId, items]]);
                    return "inserted"
                }
                if (rows.length > 0) {
                    let {order_status} = rows[0];
                    if (order_status !== orderStatus) {
                        console.log(`Updating order ${orderId} from ${order_status} to ${orderStatus}`);
                        queries.push([`
                                    UPDATE 
                                        surtrics.surplus_sales_data 
                                    SET 
                                        order_status = $1 
                                    WHERE 
                                        order_id = $2;`,
                            [order_status, orderId]]
                        )
                        console.log("updating order")
                        return "updated";
                    }
                    return "no change";
                }
            })

        Logger.log(results.reduce((acc,curr) => {
            acc[curr] = acc[curr] ? acc[curr] + 1 : 1;
            return acc;
        },{}))

        let {errors:QueryErrors} = await PromisePool
            .for(queries)
            .withConcurrency(25)
            .process(async (query) => {
                return await db.query(...query);
            })
        Logger.log("Errors: ");
        Logger.log(JSON.stringify(QueryErrors, null, 2))
        Logger.log("finished inserting into database")

        Logger.log("finished updating last updated time for shipStation")
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
