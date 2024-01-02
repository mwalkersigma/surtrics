const {parse} = require("csv-parse");
const fs = require("fs");
const {Pool} = require("pg");
const {format} = require("date-fns");


class Order {
    constructor(order) {
        this._order = order;
        this.name = order.name;
        this.orderId = order['order_id'];
        this.storeId = order['store_id'];
        this.paymentDate = format(new Date(order['payment_date']), "MM/dd/yyyy");
        this.paymentTime = format(new Date(order['payment_date']), "HH:mm:ss");
        this.orderStatus = order['order_status'];
        this.sale_id = order.sale_id;
    }

    get items() {
        return this._order.items.map(this.processItem).flat();
    }

    get total() {
        return Number(this.items.reduce((total, item) => Number(total) + Number(item.unitPrice) * Number(item.quantity), 0));
    }

    processItem(item) {
        try{
            let temp = JSON.parse(item);
            let tempPrice = temp['unitPrice'];
            if(typeof tempPrice === "string"){
                tempPrice = tempPrice.replaceAll("$", "").replaceAll(',','').trim();
                temp['unitPrice'] = +tempPrice;
            }
            return temp;

        }catch (e) {
            let temp= JSON.parse("[" + item + "]");
            temp.map(item => {
                try {
                    item['unitPrice'] = item['unitPrice']?.replaceAll("$", "").replaceAll(',', '').trim();
                    return item;
                } catch (e) {
                    return item;
                }
            })
            return temp;
        }
    }
}

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
async function processSalesData(filePath){
    let orders = await processEbayCSV(filePath);
    return orders
}


async function main () {
    let decemberSalesFromShipStation = await processSalesData("./src/scripts/decemberOrders.csv");
    let decemberSalesFromDatabase = await db.query(`
        SELECT *
        FROM surtrics.surplus_sales_data
        WHERE payment_date between '2023-12-01' and '2023-12-31'
    `);


    function countNames(array) {
        return array.reduce((acc, order) => {
            let name = order;
            if (acc[name]) {
                acc[name]+=1;
            } else {
                acc[name] = 1;
            }
            return acc;
        }, {});
    }

    let decemberSalesFromShipStationNames = decemberSalesFromShipStation.map(order => order['Recipient'])

    let nameCountShipStation = countNames(decemberSalesFromShipStationNames);
    let nameCountDatabase = countNames(decemberSalesFromDatabase.rows.map(order => order.name));



    let names = Object.keys(nameCountShipStation);

    let results = {};

    names.forEach(name => {
        if (nameCountDatabase[name] === undefined) {
            results[name] = "not in database";
        }
        // else if (nameCountShipStation[name] !== nameCountDatabase[name]) {
        //     results[name] = `
        //         Not Equal.
        //         ShipStation: ${nameCountShipStation[name]}
        //         Database: ${nameCountDatabase[name]}
        //         Difference: ${nameCountShipStation[name] - nameCountDatabase[name]}
        //     `
        // }
    });
    console.log(results)

    let missingOrders = Object
        .keys(results)
        .map(name => {
            return decemberSalesFromShipStation
                .filter(order => order['Recipient'] === name)
        })
        .flat()

    console.log(missingOrders);






}

main()
    .catch(err => {
        console.log(err);
    })











