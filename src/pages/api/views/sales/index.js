import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db";
import {parseBody} from "../../../../modules/serverUtils/parseBody";


async function getSales(req,res) {
    let query = `SELECT * FROM surtrics.surplus_sales_data`;
    let {rows} = await db.query(query);
    return res.status(200).json(rows)
}
async function getSalesWithOptions(req,res) {
    let body = parseBody(req);
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
        query+=`    ${firstToken()} DATE(payment_date - interval '3 hours') < DATE($1) + $2::interval`
        params = [body.date,body.interval];
    }

    if (body.startDate && body.endDate) {
        if(body.startDate === body.endDate){
            query += `${firstToken()} DATE(payment_date - interval '3 hours') = $${++count}::DATE \n`;
            params.push(body.startDate);
        }else{
            query += `${firstToken()} DATE(payment_date - interval '3 hours') BETWEEN $${++count}::DATE AND $${++count}::DATE \n`;
            params.push(body.startDate);
            params.push(body.endDate);
        }
    }

    if(body.startDate && !body.endDate) {
        query += `${firstToken()} DATE(payment_date - interval '3 hours') = $${++count}::DATE \n`;
        params.push(body.startDate);
    }

    if(!body.startDate && body.endDate) {
        query += `${firstToken()} DATE(payment_date - interval '3 hours') <= $${++count} \n`;
        params.push(body.endDate);
    }

    if(body.date && !body.interval) {
        query += `${firstToken()} date_trunc('day',DATE(payment_date - interval '3 hours')) = $${++count} \n`;
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
