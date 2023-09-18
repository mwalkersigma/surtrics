import db from "../../../db";
import {addMonths} from "date-fns";



async function getIncrements(date){
    let endDate = new Date(date);
    endDate = addMonths(endDate,1)
    let month = date.getMonth();
    let year = date.getFullYear();
    let baseString = `${year}-${month + 1}-01`
    month = endDate.getMonth();
    year = endDate.getFullYear();
    let endString = `${year}-${month + 1}-01`

    let query = await db.query(`
        SELECT
            date(transaction_date) as day,
            count(date(transaction_date)) AS transactions,
            transaction_reason
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
            day,
            transaction_reason
        ORDER BY
            day
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