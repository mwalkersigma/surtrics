import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db";
import {parseBody} from "../../../modules/serverUtils/parseBody";

async function getBigCommerce(req,res) {
    let query = `SELECT * FROM surtrics.surplus_big_commerce_data`;
    let {rows} = await db.query(query);
    return res.status(200).json(rows)
}
async function getBigCommerceWithParams(req,res) {
    let count = 0
    let params = [];

    let body = parseBody(req);
    let select = `
        SELECT
            sum(visits::DECIMAL) as visits,
            sum(shopped::DECIMAL) as shopped,
            sum(web_leads::DECIMAL) as web_leads,
            sum(add_to_cart::DECIMAL) as add_to_cart,
    `
    let footer = ``;

    if(body.timeScale && body.timeScale !== 'Data Points'){
        console.log(body)
        select += `
            date_trunc($${++count},date_for_week) as date_for_week
        `
        footer += `
            GROUP BY
                date_trunc($${count},date_for_week)
            ORDER BY
                date_for_week ASC
        `
        params.push(body.timeScale);
    }else{
        select += `
            date_for_week
        `
        footer += `
            GROUP BY
                date_for_week
                ORDER BY
                date_for_week ASC
                `
    }
    let query = select +
        `
        FROM
            surtrics.surplus_big_commerce_data
        `






    if (body.startDate && body.endDate) {
        query += `WHERE date_for_week BETWEEN $${++count} AND $${++count} \n`;
        params.push(body.startDate);
        params.push(body.endDate);
    }

    if(body.startDate && !body.endDate) {
        query += `WHERE date_for_week >= $${++count} \n`;
        params.push(body.startDate);
    }

    if(!body.startDate && body.endDate) {
        query += `WHERE date_for_week <= $${++count} \n`;
        params.push(body.endDate);
    }

    if(body.date) {
        query += `WHERE date_trunc('day',date_for_week) = $${++count} \n`;
        params.push(body.date);
    }

    query += footer;
    console.log(query)
    let {rows} = await db.query(query, params);
    return res.status(200).json(rows)
}


export default router({
    GET: getBigCommerce,
    POST: getBigCommerceWithParams
})
