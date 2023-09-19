import db from "../../../db";



async function individualView(dateString) {
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
    AND DATE(transaction_date) <= $1
    AND "user" != 'BSA'
    AND "user" != 'System'
GROUP BY
    user_id,
    transaction_type,
    transaction_reason`,
    [dateString]
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
        results[user_id][fullKey] += +count;
    }

    return JSON.stringify(results);
}
export default function handler (req,res) {
    let body = req.body;
    body = JSON.parse(body);
    let {date} = body;
    date = new Date(date);
    let dateString = date.toISOString().split("T")[0];
    return individualView(dateString)
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(500).json({message: err.message}));
}