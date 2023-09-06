import db from "../../../db";
import findMonday from "../../../modules/utils/findMondayFromDate";



async function getIncrements(date){
    let monday = findMonday(date);
    let sunday = new Date(monday);

    sunday.setDate(sunday.getDate() + 7);

    let sundayString = sunday.toISOString().split("T")[0];
    let mondayString = monday.toISOString().split("T")[0];

    let query = await db.query(`
        SELECT
            COUNT(*),
            DATE(transaction_date)
        FROM
            surtrics.surplus_metrics_data
        WHERE
            transaction_date >= $1
          AND transaction_date <= $2
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
            DATE(transaction_date)
    `, [mondayString, sundayString])
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