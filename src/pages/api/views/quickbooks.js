import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db";
import {parseBody} from "../../../modules/serverUtils/parseBody";

async function getQuickbooks(req,res) {
    let query = `SELECT * FROM surtrics.surplus_quickbooks_data`;
    let {rows} = await db.query(query);
    return res.status(200).json(rows)
}
async function getQuickbooksWithParams(req,res) {
    let body = parseBody(req);
    let query =
        `
        SELECT
            *
        FROM
            surtrics.surplus_quickbooks_data
        
            
        `
    let count = 0
    let params = [];

    if (body.startDate && body.endDate) {
        query += `WHERE po_date BETWEEN $${++count} AND $${++count} \n`;
        params.push(body.startDate);
        params.push(body.endDate);
    }

    if(body.startDate && !body.endDate) {
        query += `WHERE po_date >= $${++count} \n`;
        params.push(body.startDate);
    }

    if(!body.startDate && body.endDate) {
        query += `WHERE po_date <= $${++count} \n`;
        params.push(body.endDate);
    }

    if(body.date) {
        query += `WHERE date_trunc('day',po_date) = $${++count} \n`;
        params.push(body.date);
    }
    if(body['timeScale'] && body['timeScale'] !== 'Data Points') {
        let [select,from] = query.split('FROM');
        select = select.replace('*','')
        select += `
            po_id,
            po_name,
            po_number,
            date_trunc('${body['timeScale']}',po_date) as po_date,
            purchase_type,
            purchase_total,
            user_who_submitted
            
        `
        query = select + 'FROM' + from;
    }
    let {rows} = await db.query(query, params);
    return res.status(200).json(rows)
}


export default router({
    GET: getQuickbooks,
    POST: getQuickbooksWithParams
})
