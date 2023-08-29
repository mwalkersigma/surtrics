import db from "../../../db";






async function getIncrements(dateString){
    let query = await db.query(`
        SELECT
            count(*),
            date_trunc('HOUR',transaction_date) as hour
        FROM
            surtrics.surplus_metrics_data
        WHERE
            transaction_type = 'Add'
          AND transaction_reason = 'Relisting'
          AND DATE(transaction_date) = $1
        GROUP BY
            hour
    `,[dateString])
    return query.rows;
}


export default function handler (req,res) {
    let body = JSON.parse(req.body);
    let date = body.date;
    date = new Date(date);
    let dateString = date.toISOString().split("T")[0];
    return getIncrements(dateString)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}