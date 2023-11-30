import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index"
import {parseBody} from "../../../modules/serverUtils/parseBody";


function postHandler(req) {
    let body = parseBody(req);
    let date = body?.date;
    let startDate = body?.['startDate'] ?? new Date();
    let endDate = body?.['endDate']?? new Date();
    let interval = body?.['interval'];

    let query = `
        SELECT 
            *
        FROM
            surtrics.surplus_sales_data
        WHERE
            DATE(payment_date - interval '2 hours') >= $1     
    `;
    let params;
    if(date && !interval){
        query += `AND DATE(payment_date - interval '2 hours') <= $2`;
        params = [date,date];
    }
    else if(date && interval){
        query+=`    AND DATE(payment_date - interval '2 hours') < DATE($1) + $2::interval`
        params = [date,interval];
    }
    else{
        query += `  AND DATE(payment_date - interval '2 hours') < $2
        `;
        params = [startDate,endDate];
    }
    query += `
    AND order_status != 'cancelled'  
    `
    query+=`
    ORDER BY store_id;
    `
    return db.query(query,params)
        .then(result => result.rows)
        .catch(error => error)

}



export default function handler(req,res) {
    return router({
        GET: postHandler,
        POST: postHandler
    })(req,res)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json(error))
}