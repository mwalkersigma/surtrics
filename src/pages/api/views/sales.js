// import router from "../../../modules/serverUtils/requestRouter";
// import db from "../../../db/index"
// import {parseBody} from "../../../modules/serverUtils/parseBody";
//
// function getHandler(req){
//
// }
// function postHandler(req) {
//     let body = parseBody(req);
//     let date = body?.date;
//     let startDate = body?.['startDate'] ?? new Date();
//     let endDate = body?.['endDate']?? new Date();
//     let interval = body?.['interval'];
//
//     let query = `
//         SELECT
//             *
//         FROM
//             surtrics.surplus_sales_data
//         WHERE
//             DATE(payment_date - interval '2 hours') >= $1
//     `;
//
//     let params;
//     if(date && !interval){
//         query += `AND DATE(payment_date - interval '2 hours') <= $2`;
//         params = [date,date];
//     }
//     else if(date && interval){
//         query+=`    AND DATE(payment_date - interval '2 hours') < DATE($1) + $2::interval`
//         params = [date,interval];
//     }
//     else{
//         query += `  AND DATE(payment_date - interval '2 hours') < $2
//         `;
//         params = [startDate,endDate];
//     }
//     query += `
//     AND order_status != 'cancelled'
//     `
//     query+=`
//     ORDER BY store_id;
//     `
//     return db.query(query,params)
//         .then(result => result.rows)
//         .catch(error => error)
//
// }
//
//
//
// export default function handler(req,res) {
//     return router({
//         GET: postHandler,
//         POST: postHandler
//     })(req,res)
//         .then(result => res.status(200).json(result))
//         .catch(error => res.status(500).json(error))
// }


import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db";
import {parseBody} from "../../../modules/serverUtils/parseBody";


async function getSales(req,res) {
    let query = `SELECT * FROM surtrics.surplus_sales_data`;
    let {rows} = await db.query(query);
    return res.status(200).json(rows)
}
async function getSalesWithOptions(req,res) {
    let body = parseBody(req);
    console.log(body)
    let query =
        `
        SELECT
            *
        FROM
            surtrics.surplus_sales_data
        `;

    let count = 0
    let params = [];
    let firstToken = (or=false) => count === 0 ? 'WHERE' : !or ? 'AND' : "OR";



    if(body.date && body.interval){
        query+=`    ${firstToken()} DATE(payment_date - interval '2 hours') < DATE($1) + $2::interval`
        params = [body.date,body.interval];
    }

    if (body.startDate && body.endDate) {
        query += `${firstToken()} payment_date BETWEEN $${++count} AND $${++count} \n`;
        params.push(body.startDate);
        params.push(body.endDate);
    }

    if(body.startDate && !body.endDate) {
        query += `${firstToken()} payment_date >= $${++count} \n`;
        params.push(body.startDate);
    }

    if(!body.startDate && body.endDate) {
        query += `${firstToken()} payment_date <= $${++count} \n`;
        params.push(body.endDate);
    }

    if(body.date && !body.interval) {
        query += `${firstToken()} date_trunc('day',payment_date) = $${++count} \n`;
        params.push(body.date);
    }
    if(body['timeScale'] && body['timeScale'] !== 'Data Points') {
        let [select,from] = query.split('FROM');
        select = select.replace('*','')
        select += `
            sale_id,
            order_id,
            order_status,
            name,
            store_id,
            items,
            date_trunc('${body['timeScale']}',payment_date) as payment_date
        `
        query = select + 'FROM' + from;
    }
    let {rows} = await db.query(query, params);
    return res.status(200).json(rows)
}


export default router({
    GET: getSales,
    POST: getSalesWithOptions
})
