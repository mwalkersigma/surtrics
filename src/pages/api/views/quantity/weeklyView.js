
import db from "../../../../db/index"
import getStartAndEndWeekString from "../../../../modules/utils/getStartAndEndWeekString";



async function getIncrements(date){
    let [startWeekString, endOfWeekString] = getStartAndEndWeekString(date);

    let query = await db.query(`
        SELECT
            sum(quantity),
            "user" as name,
            transaction_type as type,
            transaction_reason as reason,
            DATE(transaction_date) as date

        FROM
            surtrics.surplus_metrics_data
        WHERE
            "user" != 'BSA'
          AND DATE(transaction_date) > $1
          AND DATE(transaction_date) < $2
          AND transaction_type = 'Add'
          AND (
                    transaction_reason = 'Relisting'
                OR transaction_reason = 'Add'
                OR transaction_reason = 'Add on Receiving'
            )
        GROUP BY
            name,
            type,
            reason,
            date
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