import db from "../../db";

const query = `
SELECT
    "user" as user_name
FROM
    surtrics.surplus_metrics_data
WHERE
    transaction_date >= transaction_date - interval '90 days'

GROUP BY
    user_name
`

export default function handler (req,res) {
    return db.query(query)
        .then((response) => {
            res.status(200).json(response.rows)
        })
        .catch((error) => {
            res.status(500).json(error)
        });
}
