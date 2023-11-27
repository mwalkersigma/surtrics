import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";



async function PostHandler(req,res,date,interval,increment) {
let data = await db.query(`
SELECT
    "user" AS user_id,
    transaction_type,
    transaction_reason,
    COUNT(*) AS count
FROM
    surtrics.surplus_metrics_data
WHERE
    DATE(transaction_date) >= $1
    AND transaction_date <= DATE($1) + $2::interval
    AND "user" != 'BSA'
    AND "user" != 'System'
GROUP BY
    user_id,
    transaction_type,
    transaction_reason`,
    [date,interval]
)

    const rows = data.rows;

    let results = {};
    for (let row of rows) {
        let {user_id, transaction_type, transaction_reason, count} = row;
        let fullKey = transaction_type +" "+ transaction_reason;
        if (!results[user_id]) {
            results[user_id] = {};
        }
        if (!results[user_id][fullKey]) {
            results[user_id][fullKey] = 0;
        }
        results[user_id][fullKey] += (+count);
    }

    return JSON.stringify(results);
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
        POST:PostHandler
    })(req,res,date,interval,increment)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}