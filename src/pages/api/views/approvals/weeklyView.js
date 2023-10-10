import db from "../../../../db/index"
import getStartAndEndWeekString from "../../../../modules/utils/getStartAndEndWeekString";
const query = `
    SELECT
        COUNT(*),
        user_who_approved as name,
        DATE(date_of_final_approval) as date_of_final_approval
    FROM
        surtrics.surplus_approvals
    WHERE
        user_who_approved IS NOT NULL
      AND user_who_approved != 'undefined'
      AND user_who_approved != ''
      AND date_of_final_approval >= $1
      AND date_of_final_approval <= $2
    GROUP BY
        name,
        date_of_final_approval;
`

export default async function handler(req, res) {
    if(typeof req.body === "string") req.body = JSON.parse(req.body);
    let body = req.body;
    let date = body.date;
    date = new Date(date);
    let [startWeekString, endOfWeekString] = getStartAndEndWeekString(date);
    console.log(startWeekString, endOfWeekString)
    return db.query(query, [startWeekString, endOfWeekString])
        .then((result) => {
            res.status(200).json(result.rows)
        })
        .catch((err) => {
            res.status(500).json({ error: err.message })
        })
}