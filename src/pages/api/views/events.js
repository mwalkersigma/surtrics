import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db";
import {parseBody} from "../../../modules/serverUtils/parseBody";

async function getEvents(req,res){

    return await db.query(`
        SELECT
            *
        FROM
            surtrics.surplus_event_data;
    `)
        .then(({rows}) => rows)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}

async function postHandler(req,res){
    let body = parseBody(req);
    let query =
        `
        SELECT
            *
        FROM
            surtrics.surplus_event_data
        `
    let count = 0
    let params = [];

    if (body.startDate && body.endDate) {
        query += `WHERE event_date BETWEEN $${++count} AND $${++count} \n`;
        params.push(body.startDate);
        params.push(body.endDate);
    }

    if(body.startDate && !body.endDate) {
        query += `WHERE event_date >= $${++count} \n`;
        params.push(body.startDate);
    }

    if(!body.startDate && body.endDate) {
        query += `WHERE event_date <= $${++count} \n`;
        params.push(body.endDate);
    }

    if(body.date) {
        query += `WHERE date_trunc('day',event_date) = $${++count} \n`;
        params.push(body.date);
    }

    let {rows} = await db.query(query, params);
    return res.status(200).json(rows)
}

export default function handler(req,res) {
    return router({
        GET: getEvents,
        POST: postHandler
    })(req,res)

}