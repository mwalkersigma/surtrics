import serverAdminWrapper from "../../../../modules/auth/serverAdminWrapper";
import router from "../../../../modules/serverUtils/requestRouter";
import Query from "../../../../modules/classes/query";
import db from "../../../../db";

const errorInsertQuery = `
    INSERT INTO nfs.surtrics.surplus_metrics_data
    ("user", sku, code, scanned_code, lot_number, title, location, quantity, quantity_before, quantity_after,
     transaction_note, transaction_reason, transaction_type, serial_numbers, context, transaction_date)
    VALUES ($1, null, null, null, null, null, $6, null, null, null, $2, $3, 'Error', null, $4, $5)
    RETURNING id
`
const auditInsertQuery = `
    INSERT INTO nfs.sursuite.quality_assurance (auditor, audit_date, tote_id, tote_qty, tote_qty_incorrect, tote_errors)
    VALUES ($1, $2, $3, $4, $5, $6)
`

//todo
function getHandler(req, res) {
    const query = new Query('nfs.sursuite.quality_assurance', ['*'])
    return query.run(db, console.log).then(({rows}) => rows);


}

//todo
async function postHandler(req, res, {user}) {
    const body = req.body;
    const audit_date = body?.auditDate;
    const tote_id = body?.toteID;
    const tote_qty = body?.toteQuantity;
    const tote_qty_incorrect = body?.quantityIncorrect
    const auditor = user.email;
    const errors = body?.errors;

    if (errors.length > 0) {
        for (let i = 0; i < errors.length; i++) {
            const error = errors[i];
            const {location, notes, reason, user} = error;
            errors[i] = await db.query(errorInsertQuery, [user, notes, reason, auditor, audit_date, location]).then(({rows}) => +rows[0].id);
        }
    }

    await db.query(auditInsertQuery, [auditor, audit_date, tote_id, tote_qty, tote_qty_incorrect, errors]);

    return {
        message: "Audit has been successfully submitted."
    }
}

export default function handler(req, res) {
    return serverAdminWrapper(async (req, res, user) => {
        return router({
            GET: getHandler,
            POST: postHandler,
        })(req, res, user)
    }, "surplus director")(req, res)
        .then((response) => res.status(200).json(response))
        .catch((error) => res.status(500).json({error}));
}