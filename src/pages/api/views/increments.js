import db from "../../../db";
import getStartAndEndWeekString from "../../../modules/utils/getStartAndEndWeekString";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import router from "../../../modules/serverUtils/requestRouter";



async function getIncrements(req,res,date,interval,increment){
    console.log(date.toISOString(),interval,increment)
    let query = await db.query(`
        SELECT
            COUNT(*),
            date_trunc($3,transaction_date) as date_of_transaction,
            transaction_reason
        FROM
            surtrics.surplus_metrics_data
        WHERE
            transaction_date >= $1
            AND transaction_date <= DATE($1) + $2::interval
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
            date_of_transaction,
            transaction_reason
    `, [date.toISOString(), interval,increment])
    return query.rows;
}


export default function handler (req,res) {
    let date,body,interval,increment;
    body = parseBody(req);

    date = body?.date ? new Date(body.date) : new Date();
    if(!body?.interval){
        return res.status(400).json({error: "No interval provided"})
    }

    interval = body.interval;
    increment = body.increment || interval

    return router({
        POST:getIncrements
    })(req,res,date,interval,increment)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })

}