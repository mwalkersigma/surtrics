import db from "../../../../db/index";
import {addMonths} from "date-fns";



export default function handler (req, res){
    if(typeof req.body === "string") req.body = JSON.parse(req.body);
    let body = req.body;
    let date = body.date;
    date = new Date(date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let startMonth = `${year}-${month}-01`;
    let endMonth = addMonths(new Date(startMonth), 2);
    year = endMonth.getFullYear();
    month = endMonth.getMonth() + 1;
    endMonth = `${year}-${month}-01`;
    return db.query(`
        SELECT
            COUNT(*),
            user_who_approved as name,
            DATE(date_of_final_approval) as date_of_final_approval
        FROM
            surtrics.surplus_approvals
        WHERE
            user_who_approved IS NOT NULL
            AND user_who_approved != 'undefined'
            AND date_of_final_approval >= '${startMonth}'
            AND date_of_final_approval <= '${endMonth}'
        GROUP BY
            name,
            date_of_final_approval;
    `)
        .then(({rows}) => {
            res.status(200).json(rows);
        })
        .catch((err) => {
            res.status(500).json({err});
        })
}