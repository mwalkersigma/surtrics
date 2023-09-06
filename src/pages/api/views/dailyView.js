import db from "../../../db";






async function getIncrements(dateString){
    let query = await db.query(`
        SELECT
            count(*),
            date_trunc('HOUR',transaction_date) as hour
        FROM
            surtrics.surplus_metrics_data
        WHERE
            DATE(transaction_date) = $1
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