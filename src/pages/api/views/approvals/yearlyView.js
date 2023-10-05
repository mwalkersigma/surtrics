import db from "../../../../db/index"
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
      AND date_of_final_approval >= $1
      AND date_of_final_approval <= $2
    GROUP BY
        name,
        date_of_final_approval;
`

export default async function handler(req, res) {
    console.log(req.body)
    if(typeof req.body === "string") req.body = JSON.parse(req.body);
    let body = req.body;
    let date = body.date;
    date = new Date(date);
    let year = date.getFullYear();
    let startYear = `${year}-01-01`;
    let endYear = `${year}-12-31`;
    return db.query(query, [startYear, endYear])
        .then((result) => {
            res.status(200).json(result.rows)
        })
        .catch((err) => {
            res.status(500).json({ error: err.message })
        })
}