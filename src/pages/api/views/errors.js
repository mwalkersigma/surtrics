import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";






async function getHandler(req, res, ...options) {
    return await db.query(`
        SELECT
            COUNT(*) as count,
            date_trunc('day',transaction_date) as date_of_transaction
        FROM
            surtrics.surplus_metrics_data
        WHERE
            transaction_type = 'Error'
        GROUP BY
            date_of_transaction
    `)
    .then(({rows})=> rows)
}

async function posthandler(req, res, ...options) {
    let body = parseBody(req);
    let query =
        `
        SELECT
            *
        FROM
            surtrics.surplus_metrics_data
        WHERE
            transaction_type = 'Error'
        `
    let count = 0
    let params = [];

    if (body.startDate && body.endDate) {
        query += `AND transaction_date BETWEEN $${++count} AND $${++count} \n`;
        params.push(body.startDate);
        params.push(body.endDate);
    }

    if(body.startDate && !body.endDate) {
        query += `AND transaction_date >= $${++count} \n`;
        params.push(body.startDate);
    }

    if(!body.startDate && body.endDate) {
        query += `AND transaction_date <= $${++count} \n`;
        params.push(body.endDate);
    }

    if(body.error_type) {
        query += `AND error_type = $${++count} \n`;
        params.push(body.error_type);
    }

    if(body.date) {
        query += `AND date_trunc('day',transaction_date) = $${++count} \n`;
        params.push(body.date);
    }

    if (body.name){
        console.log(body.name)
        query += `AND "user" = $${++count} \n`;
        params.push(body.name);
    }
    console.log(query)
    console.log(params)
    return await db.query(query, params)
        .then(({rows})=> rows)
}



export default function handler(req, res) {
    return router({
        GET: getHandler,
        POST: posthandler
    })(req, res)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}