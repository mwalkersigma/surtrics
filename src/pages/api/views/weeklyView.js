import db from "../../../db";


function getMonday(){
    let date = new Date();
    let day = date.getDay();
    let diff = date.getDate() - day + (day === 0 ? -6:1);
    if(day > 0 && day < 6){
        // returns this monday
        return new Date(date.setDate(diff));
    }else{
        // returns next monday
        return new Date(date.setDate(diff + 7));
    }
}


async function getIncrements(){
    let monday = getMonday();
    // convert monday to yyyy-mm-dd
    let mondayString = monday.toISOString().split("T")[0];
    let query = await db.query(`
    SELECT 
        COUNT(*) ,
        transaction_date
    FROM 
        surtrics.surplus_metrics_data
    WHERE 
        transaction_type = 'Add'
        AND transaction_reason = 'Relisting'
        AND transaction_date >= $1
    GROUP BY 
        transaction_date
    `,[mondayString])

    return query.rows;
}


export default function handler (req,res) {
    return getIncrements()
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}