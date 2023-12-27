import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";



async function getHandler(req,res){
    let query = `
        SELECT
            *
        FROM
            surtrics.surplus_pricing_data
    `
    return db.query(query)
        .then(({rows})=>res.status(200).json(rows))
}

async function postHandler(req,res){
    let query = `
        SELECT
            *
        FROM
            surtrics.surplus_pricing_data
    `
    const body = parseBody(req);

    let count = 0
    let params = [];

    if (body.startDate && body.endDate) {
        query += `WHERE date_priced BETWEEN $${++count} AND $${++count} \n`;
        params.push(body.startDate);
        params.push(body.endDate);
    }

    if(body.startDate && !body.endDate) {
        query += `WHERE date_priced >= $${++count} \n`;
        params.push(body.startDate);
    }

    if(!body.startDate && body.endDate) {
        query += `WHERE date_priced <= $${++count} \n`;
        params.push(body.endDate);
    }

    if(body.date) {
        query += `WHERE date_trunc('day',date_priced) = $${++count} \n`;
        params.push(body.date);
    }

    let {rows} = await db.query(query, params);
    return res.status(200).json(rows)


}



export default router({
    GET:getHandler,
    POST:postHandler
})