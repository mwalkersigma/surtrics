import db from "../../../db";



async function getIncrements(date){
    let year = date.getFullYear();
    let baseString = `${year}-01-01`
    let endString = `${year + 1}-01-01`
    let query = await db.query(`
        SELECT
            date_part('month',transaction_date) as month,
            count(date(transaction_date)) AS transactions
        FROM
            surtrics.surplus_metrics_data
        WHERE
            transaction_date >= $1
          AND transaction_date < $2
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
            month
        ORDER BY
            month
    `, [baseString,endString])
    return query.rows;
}


export default function handler (req,res) {
    let date = new Date();
    if(req.body){
        let body = JSON.parse(req.body) ?? {date: new Date()};
        date = new Date(body.date);
    }
    return getIncrements(date)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}