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

    let firstToken = () => count === 0 ? 'WHERE' : 'AND';

    if(body['timeScale'] && body['timeScale'] !== 'Data Points') {
        let [select,from] = query.split('FROM');
        select = select.replace('*','')
        select += `
            event_id,
            event_name,
            event_notes,
            affected_categories,
            date_trunc('${body['timeScale']}',event_date) as event_date
        `
        query = select + 'FROM' + from;
    }

    if(body['excludedCategories']) {
        body['excludedCategories'].forEach((category)=>{
            query += `${firstToken()} affected_categories @> $${++count}::text[] = false  \n`
            params.push([category]);
        })

    }

    if (body.startDate && body.endDate) {
        query += `${firstToken()} event_date BETWEEN $${++count} AND $${++count} \n`;
        params.push(body.startDate);
        params.push(body.endDate);
    }

    if(body.startDate && !body.endDate) {
        query += `${firstToken()} event_date >= $${++count} \n`;
        params.push(body.startDate);
    }

    if(!body.startDate && body.endDate) {
        query += `${firstToken()} event_date <= $${++count} \n`;
        params.push(body.endDate);
    }

    if(body.date) {
        query += `WHERE date_trunc('day',event_date) = $${++count} \n`;
        params.push(body.date);
    }
    console.log(query)
    console.log(params)
    let {rows} = await db.query(query, params);
    return res.status(200).json(rows)
}

export default function handler(req,res) {
    return router({
        GET: getEvents,
        POST: postHandler
    })(req,res)

}