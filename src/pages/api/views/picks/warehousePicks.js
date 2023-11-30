import db from "../../../../db/index"
import getStartAndEndWeekString from "../../../../modules/utils/getStartAndEndWeekString";
import {parseBody} from "../../../../modules/serverUtils/parseBody";
import router from "../../../../modules/serverUtils/requestRouter";
const query = `
    SELECT
        COUNT(*) as sum,
        "user" as name,
        DATE_TRUNC($3,transaction_date) as date
    FROM
        surtrics.surplus_metrics_data
    WHERE
        transaction_type = 'Pick'
        AND DATE(transaction_date) >= $1
        AND DATE(transaction_date) <= DATE($1) + $2::interval
    GROUP BY
        name,
        date;
`

function PostHandler(req,res,date,interval,increment) {
    return db.query(query,[date,interval,increment])
        .then(({rows}) => rows);
}

export default async function handler(req, res) {
    let date,body,interval,increment;
    body = parseBody(req);

    date = body?.date ? new Date(body.date) : new Date();
    if(!body?.interval){
        return res.status(400).json({error: "No interval provided"})
    }

    interval = body.interval;
    increment = body.increment || interval
    return router({
        POST:PostHandler
    })(req,res,date,interval,increment)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}