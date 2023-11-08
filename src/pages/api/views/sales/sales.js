import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db/index";
import {parseBody} from "../../../../modules/serverUtils/parseBody";

function getSales(req) {
    const body = parseBody(req)
    let date = body?.date;
    if (!date) {
        date = new Date();
    }
    const [yyyy,mm,dd] = date.split("T")[0].split("-");

    return db.query(`
        SELECT *
        FROM surtrics.surplus_sales_data
        WHERE DATE(payment_date - interval '2 hours') = '${yyyy}-${mm}-${dd}'
        ORDER BY store_id;
    `)
        .then(result => result.rows)
        .catch(error => error)
}


export default function handler(req, res) {
    return router({
        GET: getSales,
        POST: getSales
    })(req, res)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json(error))
}