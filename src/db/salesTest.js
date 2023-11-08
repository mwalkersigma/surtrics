const fs = require("fs");
function convertOrderToSQL(orders){
    let queryString = `INSERT INTO surtrics.surplus_sales_data (payment_date, order_id, order_status, name, store_id, items) VALUES`
    orders.forEach(order => {
        let {paymentDate, orderId, orderStatus, name, storeId, items} = order;
        queryString += `( '${paymentDate}', '${orderId}', '${orderStatus}', '${name}', '${storeId}', Array['${items}']), \n`
    });
}

(async () => {
    const path = "../json/orders.json";
    let file = fs.readFileSync(path);
    let orders = JSON.parse(file);
    let queryString = `INSERT INTO surtrics.surplus_sales_data (payment_date, order_id, order_status, name, store_id, items) VALUES`
    const storeID = 225004;
    orders =
        orders
            .map(order => {
                let paymentDate = new Date(order.paymentDate).toISOString();
                let orderId = order.orderId;
                let orderStatus = order.orderStatus;
                let name = order.shipTo.name.replaceAll("'","");
                let items = order.items
                    .map(item => {
                        let {sku, quantity, unitPrice} = item;
                        return {sku, quantity, unitPrice};
                    })
                    .map(item => JSON.stringify(item));
                console.log(items)
                let storeId = order.advancedOptions.storeId;
                return {paymentDate, orderId, orderStatus, items, storeId , name};
            })
            .filter(order => order.storeId === storeID)
            .forEach(order => {
              queryString += `( '${order.paymentDate}', '${order.orderId}', '${order.orderStatus}', '${order.name}', '${order.storeId}', Array['${order.items}']), \n`
            });
     fs.writeFileSync("../db/salesData.psql", queryString);

})()

// const Pool = require("pg").Pool;
//
//
//
// (async () => {
//     const pool = new Pool({
//         connectionString:"postgres://apiinsync:bf4XLT%25Mq3irj%23dZ@sigma-postgres.postgres.database.azure.com:5432/nfs?sslmode=require"
//     });
//     const db = {
//         query(text, params){
//             return pool.query(text, params);
//         },
//     };
//
//     let {rows} = await db.query(`
//         SELECT * FROM surtrics.surplus_sales_data;
//     `);
//
//
//     rows = rows.map(sales =>{
//         sales.items = sales.items.map(item=>JSON.parse(item));
//         return sales;
//     });
//     console.log(JSON.stringify(rows,null,2))
//
// })

