import db from "../../../db";
import findMonday from "../../../modules/utils/findMondayFromDate";





async function getIncrements(date){
    let monday = findMonday(date);
    let sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    let sundayString = sunday.toISOString().split("T")[0];
    // convert monday to yyyy-mm-dd
    let mondayString = monday.toISOString().split("T")[0];
    let query = await db.query(`
    SELECT 
        COUNT(*),
        DATE(transaction_date)
    FROM 
        surtrics.surplus_metrics_data
    WHERE 
        transaction_type = 'Add'
      AND transaction_reason = 'Relisting'
      AND transaction_date >= $1
      AND transaction_date <= $2
    GROUP BY 
        DATE(transaction_date)
    `, [mondayString, sundayString])

    return query.rows;
}


export default function handler (req,res) {
    console.log("req.body: ", req.body)
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