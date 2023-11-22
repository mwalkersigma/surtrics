import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";






async function getHandler(req, res, ...options) {
    return await db.query(`
        SELECT
            COUNT(*) as count,
            date_trunc('day',transaction_date) as date_of_transaction
        FROM
            surtrics.surplus_metrics_data
        WHERE
            transaction_type = 'Error'
        GROUP BY
            date_of_transaction
    `)
    .then(({rows})=> rows)
}

export default function handler(req, res) {
    return router({
        GET: getHandler
    })(req, res)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}