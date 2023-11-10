import db from "../../../db";
import getStartAndEndWeekString from "../../../modules/utils/getStartAndEndWeekString";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import router from "../../../modules/serverUtils/requestRouter";
async function getIncrements(req,res,date,interval){
    let query = await db.query(`
        SELECT
            COUNT(*),
            user_who_approved as name,
            DATE(date_of_final_approval) as date_of_final_approval
        FROM
            surtrics.surplus_approvals
        WHERE
            user_who_approved IS NOT NULL
          AND user_who_approved != 'undefined'
          AND date_of_final_approval >= $2
          AND date_of_final_approval <= DATE($2) + $1::interval
        GROUP BY
            name,
            date_of_final_approval;
    `, [interval,date])
    return query.rows;
}


export default function handler (req,res) {
    let date,body,interval;
    body = parseBody(req);

    date = body?.date ? new Date(body.date) : new Date();
    if(!body?.interval){
        return res.status(400).json({error: "No interval provided"})
    }
    interval = body.interval;
    return router({
        POST:getIncrements
    })(req,res,date,interval,)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })

}