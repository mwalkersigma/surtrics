const {parse} = require("csv-parse");
const fs = require("fs");
const {Pool} = require("pg");
const {PromisePool} = require("@supercharge/promise-pool")


const shipStationToken = process.env.SHIPSTATION_TOKEN;

console.log(shipStationToken)


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
            let items = [{
                sku: order["Custom Label"],
                name: order["Item Title"],
                quantity: order["Quantity"],
                unitPrice: order["Sold For"],
            }];
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
        .filter(order => order.paymentDate >= new Date("2021-05-31"))
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
        const {page,pages,total,orders} = data;
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
    let ebayOrders = await ebaySeed("./src/scripts/eBay.csv")


    let historicalOrders = await getShipStationOrders({
        pageSize: 500,
        paymentDateStart: "01-01-2020",
        paymentDateEnd: "05-31-2023",
        storeId: 225004,
    })

    let newOrders = await getShipStationOrders({
        pageSize: 500,
        paymentDateStart: "06-01-2021",
    })

    let orders = historicalOrders
        .concat(newOrders)
        .map(order => {
            let paymentDate = new Date(order.paymentDate).toISOString();
            let orderId = order.orderId;
            let orderStatus = order.orderStatus;
            let name = order.shipTo.name.replaceAll("'","");
            let items = processItems(order.items);
            let storeId = order.advancedOptions.storeId;
            return {paymentDate, orderId, orderStatus, items, storeId , name};
        })
        .concat(ebayOrders)
    let queries = [];
    let queryString = `INSERT INTO surtrics.surplus_sales_data (payment_date, order_id, order_status, name, store_id, items) VALUES`
    orders.forEach(order => {
        let {paymentDate, orderId, orderStatus, name, storeId, items} = order;
        queries.push(queryString + `( '${paymentDate}', '${orderId}', '${orderStatus}', '${name}', '${storeId}', Array['${items}']);`)
    });
    let {results} = await PromisePool
        .for(queries)
        .withConcurrency(250)
        .process(async (query) => {
            console.log(query)
            await db.query(query);
        });
    console.log(results)
    console.log("done")

}

main()
    .catch(err => {
        console.log(err);
    })











