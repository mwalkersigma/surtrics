import db from "../../../db";
import findStartOfWeek from "../../../modules/utils/findMondayFromDate";



async function getIncrements(date){
    let startOfWeek = findStartOfWeek(date);
    startOfWeek.setDate(startOfWeek.getDate() - 1);

    let endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 8);

    let endOfWeekString = endOfWeek.toISOString().split("T")[0];
    let startWeekString = startOfWeek.toISOString().split("T")[0];

    let query = await db.query(`
        SELECT
            COUNT(*),
            DATE(transaction_date),
            transaction_reason
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
            DATE(transaction_date),
            transaction_reason
    `, [startWeekString, endOfWeekString])
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