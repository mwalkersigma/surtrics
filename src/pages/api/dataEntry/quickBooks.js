import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index"
import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import {parseBody} from "../../../modules/serverUtils/parseBody";

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
function getHandler(req, res) {
    return serverAdminWrapper(async (req, res, {user:{name}}) => {
    return db.query(`
        SELECT * FROM surtrics.surplus_quickbooks_data
        WHERE user_who_submitted = $1
    `,[name])
    },"bsa","surplus director")(req,res)
        .then(({rows}) => {
            res.status(200).json(rows);
        })
        .catch((error) => {
            res.status(500).json({error});
        });
}

function deleteHandler(req, res) {
    return serverAdminWrapper((req,res)=> {
        return db.query(`
            DELETE
            FROM surtrics.surplus_quickbooks_data
            WHERE po_id = $1
        `, [parseBody(req).id])
            .then(() => {
                res.status(200).json({message: "Successfully deleted data"});
            })
            .catch((error) => {
                res.status(500).json({error});
            });
    },"bsa","surplus director")(req,res)

}

export default function handler (req, res) {
    return router({
        PUT: putHandler,
        GET: getHandler,
        DELETE: deleteHandler,
    })(req, res)

}