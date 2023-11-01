import router from "../../../modules/utils/requestRouter";
import db from "../../../db/index"

function parseBody(req) {
    let body = req.body;
    if(typeof body === 'string') {
        body = JSON.parse(body)
    }
    return body;

}
function putHandler(req, res) {
    let body = parseBody(req);
    const {
        customer_name,
        po_number,
        date_of_sale,
        purchase_type,
        total_amount,
        user_who_submitted,
    } = body;
    return db.query(`
       INSERT INTO surtrics.surplus_quickbooks_data (po_name, po_number, po_date, purchase_type, purchase_total, user_who_submitted)
         VALUES ($1, $2, $3, $4, $5, $6)
    `,[customer_name, po_number, date_of_sale, purchase_type, total_amount, user_who_submitted])
        .then(() => {
            res.status(200).json({message:"Successfully added data"});
        })
        .catch((error) => {
            res.status(500).json({error});
        });

}


export default function handler (req, res) {
    return router({
        PUT: putHandler,
    })(req, res)

}