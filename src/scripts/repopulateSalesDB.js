const {parse} = require("csv-parse");
const fs = require("fs");
const {Pool} = require("pg");
const {PromisePool} = require("@supercharge/promise-pool")
const {performance} = require('perf_hooks');
// perf hooks
const shipStationToken = process.env.SHIPSTATION_TOKEN;

const pool = new Pool({
    connectionString:process.env.CONNECTION_STRING
});

const db = {
    query(text, params){
        return pool.query(text, params);
    },
}
function processItems(items) {
    return items
        .map(item => {
            let {sku, quantity,name, unitPrice} = item;
            name = name.replaceAll("'","");
            return {sku, quantity, name, unitPrice};
        })
        .map(item => JSON.stringify(item));
}
async function processCSV ( filePath,  callback ) {
    return new Promise((resolve, reject) =>{
        const parser = parse({
            delimiter: ",",
            relaxQuotes: true,
            relax_column_count: true,
        });
        fs.createReadStream(filePath, "utf8").pipe(parser);
        parser.on("readable", () => {
            let record;
            while (record = parser.read()) {
                callback(record);
            }
        });
        parser.on("end", () => {
            console.log("done");
            resolve()
        });
        parser.on("error", (err) => {
            reject(err);
        })
    })
}
async function processEbayCSV ( filePath ) {
    let headers;
    let results = [];
    await processCSV(filePath,(record) => {
        if (!headers) {
            headers = record.map(item => item.trim());
        } else {
            let obj = {};
            record.forEach((item, index) => {
                obj[headers[index]] = item;
            })
            results.push(obj);
        }
    })
    return results;
}
async function ebaySeed(filePath){
    let orders = await processEbayCSV(filePath);
    return orders
        .map(order => {
            let paymentDate = order["Paid On Date"]
            let orderId = "E" + order["Sales Record Number"];
            let orderStatus = "Shipped";
            let name = order["Buyer Username"];
            let storeId = "255895"
            let items = processItems([{
                sku: order["Custom Label"],
                name: order["Item Title"].replaceAll("'",""),
                quantity: order["Quantity"],
                unitPrice: order["Sold For"],
            }]);
            return {
                paymentDate,
                orderId,
                orderStatus,
                name,
                storeId,
                items,
            }
        })
        .map(order => {
            if(!order.paymentDate)return;
            let [monthName,day,year] = order.paymentDate.split("-");
            const convertMonthNameToNumber = (monthName) => {
                let month = new Date(Date.parse(monthName +" 1, 2023")).getMonth()+1;
                return month < 10 ? "0" + month : month;
            }
            let month = convertMonthNameToNumber(monthName);
            let paymentDate = new Date(`${month}-${day}-${year}`).toISOString();
            return {
                ...order,
                paymentDate
            }
        })
        .filter(order => order?.paymentDate)
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

        let headers ={
            "Authorization": "Basic " + shipStationToken
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
    await db.query("DROP TABLE IF EXISTS surtrics.surplus_sales_data;");
    await db.query(`
        CREATE TABLE IF NOT EXISTS surtrics.surplus_sales_data(
            sale_id BIGSERIAL PRIMARY KEY NOT NULL ,
            payment_date timestamp NOT NULL ,
            order_id VARCHAR(255) NOT NULL,
            order_status VARCHAR(50) NOT NULL,
            name TEXT NOT NULL,
            store_id INT NOT NULL,
            items text[] NOT NULL
    );
`);
    console.log("Getting ebay orders")
    let ebayOrders = await ebaySeed("./src/scripts/eBay.csv")

    console.log("Getting historical orders")
    let bigCommerceOrders = await getShipStationOrders({
        pageSize: 500,
        paymentDateStart: "01-01-2020",
        storeId: 225004,
    });
    console.log("Finished getting orders from 2020-2023 for store 225004")
    console.log("Getting orders from june 2023 to present")
    let newOrders = await getShipStationOrders({
        pageSize: 500,
        paymentDateStart: "06-01-2023",
    })

    let orders = bigCommerceOrders
        .concat(newOrders)
        .map(order => {
            let paymentDate = new Date(order.paymentDate).toISOString();
            let orderId = order.orderId;
            let orderStatus = order.orderStatus;
            let name = order['shipTo'].name.replaceAll("'","");
            let items = processItems(order.items);
            let storeId = order['advancedOptions'].storeId;
            return {paymentDate, orderId, orderStatus, items, storeId , name};
        })
        .concat(ebayOrders)

    let fullSize = orders.length;

    orders = [...new Set(orders.map(order => JSON.stringify(order)))].map(order => JSON.parse(order));

    console.log("Full size",fullSize)
    console.log("Orders",orders.length)
    console.log("Duplicates removed: ",fullSize - orders.length);


    let queries = [];
    orders.forEach(order => {
        let {paymentDate, orderId, orderStatus, name, storeId, items} = order;
        queries.push(`
            INSERT INTO surtrics.surplus_sales_data (payment_date, order_id, order_status, name, store_id, items) 
            VALUES ( '${paymentDate}', '${orderId}', '${orderStatus}', '${name}', '${storeId}', Array['${items}']);`)
    });
    await PromisePool
        .for(queries)
        .withConcurrency(250)
        .process(async (query) => {
            await db.query(query);
        });

}

performance.mark('A');
main()
    .then(() => {
        // finish the performance measurement
        performance.mark('B');
        performance.measure('A to B', 'A', 'B');
        const measure = performance.getEntriesByName('A to B')[0];
        console.log(`Repopulate Sales DB took ${measure.duration} milliseconds to execute.`);
        console.log(`Repopulate Sales DB took ${measure.duration / 1000} seconds to execute.`);
        console.log(`Repopulate Sales DB took ${measure.duration / 1000 / 60} minutes to execute.`);
        console.log("done")
    })
    .catch(err => {
        console.log(err);
    })











