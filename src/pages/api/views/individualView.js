import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";



async function PostHandler(req,res,date,interval) {
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
        if(fullKey.toLowerCase().includes("create")){
            results[user_id][fullKey] = (+count / 4);
            continue;
        }
        results[user_id][fullKey] += (+count);
    }
    return results;
}
export default function handler (req,res) {
    let date,body;
    body = parseBody(req);

    date = body?.date ? new Date(body.date) : new Date();
    let interval = body.interval || "1 day"
    return router({
        POST:PostHandler
    })(req,res,date,interval)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}