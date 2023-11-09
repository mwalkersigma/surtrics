import db from "../../../db";
import getStartAndEndWeekString from "../../../modules/utils/getStartAndEndWeekString";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import router from "../../../modules/serverUtils/requestRouter";



async function getIncrements(req,res,date,amount, interval){
    console.log(date,amount,interval)
    let query = await db.query(`
        SELECT
            COUNT(*),
            date_trunc($1,transaction_date) as "timestamp",
            transaction_reason
        FROM
            surtrics.surplus_metrics_data
        WHERE
            transaction_date > $2
          AND transaction_date <= $2 + $3::interval
          AND (
                    transaction_type = 'Add'
                OR transaction_type = 'Remove'
                        AND transaction_reason = 'Relisting'
            )
          AND (
                    transaction_reason = 'Add'
                OR transaction_reason = 'Add on Receiving'
                OR transaction_reason = 'Relisting'
            )
        GROUP BY
            "timestamp",
            transaction_reason
    `, [interval,date,amount + interval])
    return query.rows;
}


export default function handler (req,res) {
    let date,body,interval,amount;
    body = parseBody(req);

    date = body?.data ? new Date(body.data) : new Date();
    if(!body?.interval){
        return res.status(400).json({error: "No interval provided"})
    }

    amount = body.amount ? body.amount : 1;
    interval = body.interval;
    console.log(interval,amount,date,body)
    return router({
        POST:getIncrements
    })(req,res,date,amount,interval)
        .then((response) => {
            console.log(response)
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })

}