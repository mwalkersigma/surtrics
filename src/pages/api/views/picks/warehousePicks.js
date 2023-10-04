import db from "../../../../db/index"
import getStartAndEndWeekString from "../../../../modules/utils/getStartAndEndWeekString";
const query = `
    SELECT
        COUNT(*) as sum,
        "user" as name,
        DATE_TRUNC('day',transaction_date) as date
    FROM
        surtrics.surplus_metrics_data
    WHERE
        transaction_type = 'Pick'
        AND DATE(transaction_date) > $1
        AND DATE(transaction_date) < $2
    GROUP BY
        name,
        date;
`

export default async function handler(req, res) {
    if(typeof req.body === "string") req.body = JSON.parse(req.body);
    let body = req.body;
    let date = body.date;
    date = new Date(date);
    let [startWeekString, endOfWeekString] = getStartAndEndWeekString(date);
    return db.query(query, [startWeekString, endOfWeekString])
        .then((result) => {
            res.status(200).json(result.rows)
        })
        .catch((err) => {
            res.status(500).json({ error: err.message })
        })
}