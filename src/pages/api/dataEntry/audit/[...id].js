import serverAdminWrapper from "../../../../modules/auth/serverAdminWrapper";
import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db";
import Query from "../../../../modules/classes/query";

const errorInsertQuery = `
    INSERT INTO 
                nfs.surtrics.surplus_metrics_data
                ("user", sku,code, scanned_code, lot_number, title, location, quantity, quantity_before, quantity_after, transaction_note, transaction_reason, transaction_type, serial_numbers, context, transaction_date)
            VALUES
             ($1,null,null,null,null,null,$6,null,null,null,$2,$3,'Error',null,$4,$5)
            RETURNING id
`
const auditInsertQuery = `
    INSERT INTO
        nfs.sursuite.quality_assurance (auditor, audit_date, tote_id, tote_qty, tote_qty_incorrect, tote_errors)
    VALUES
        ($1,$2,$3,$4,$5,$6)
`

async function getAudit(id, detailed = false) {
    const query = new Query('nfs.sursuite.quality_assurance', ['*']).addWhere('id', '=', id);
    const row = await query.run(db).then(({rows}) => rows[0]);

    if (detailed) {
        for (let i = 0; i < row['tote_errors'].length; i++) {
            row['tote_errors'][i] = await new Query('nfs.surtrics.surplus_metrics_data', ['*']).addWhere('id', '=', row['tote_errors'][i]).run(db).then(({rows}) => rows[0]);
        }
    }

    return row;
}

function getHandler(req, res) {
    const {id, detailed} = req.query;
    return getAudit(id[0], detailed);
}


//todo
async function putHandler(req, res, {user}) {
    let id = req.query.id[0];
    let originalAudit = await getAudit(id);
    let body = req.body;

    // convert the body from camelCase to snake_case
    const audit_date = body?.auditDate;
    const tote_id = body?.toteID;
    const tote_qty = body?.toteQuantity;
    const tote_qty_incorrect = body?.quantityIncorrect
    const auditor = user.email;

    let convertedToDbCase = {
        audit_date,
        tote_id,
        tote_qty,
        tote_qty_incorrect,
    }

    let updatedInformation = {
        ...originalAudit,
        ...convertedToDbCase,
    }
    // now handle the errors from the audit.
    let originalErrors = originalAudit.tote_errors;

    let updatedErrors = body.tote_errors;
    let updatedErrorsIds = body.tote_errors.map(error => +error.id);


    let errorsToDelete = originalErrors.filter(error => !updatedErrorsIds.includes(error));
    let errorsToAdd = updatedErrorsIds.filter(error => !originalErrors.includes(error));


    if (errorsToAdd.length > 0) {
        for (let i = 0; i < errorsToAdd.length; i++) {
            const errorID = errorsToAdd[i];
            const error = updatedErrors.find(error => error.id === errorID);
            const {location, notes, reason, user} = error;
            errorsToAdd[i] = await db.query(errorInsertQuery, [user, notes, reason, auditor, audit_date, location]).then(({rows}) => +rows[0].id);
        }
    }

    if (errorsToDelete.length > 0) {
        for (let i = 0; i < errorsToDelete.length; i++) {
            originalErrors = originalErrors.filter(error => error !== errorsToDelete[i]);
            await db.query(`DELETE FROM nfs.surtrics.surplus_metrics_data WHERE id = $1`, [errorsToDelete[i]]);
        }
    }

    updatedInformation.tote_errors = [...originalErrors, ...errorsToAdd];


    await db.query(
        `UPDATE nfs.sursuite.quality_assurance
         SET audit_date = $1,
             tote_id = $2,
             tote_qty = $3,
             tote_qty_incorrect = $4,
             tote_errors = $5
         WHERE id = $6`,
        [audit_date, tote_id, tote_qty, tote_qty_incorrect, updatedInformation.tote_errors, id]
    );

    return "Audit has been successfully updated."

}

//todo
function deleteHandler(req, res, {user}) {

}

//todo
//database table: sursuite.quality_assurance

export default function handler(req, res) {

    return serverAdminWrapper(async (req, res, user) => {
        return router({
            GET: getHandler,
            PUT: putHandler,
        })(req, res, user)
    }, "surplus director")(req, res)
        .then((response) => res.status(200).json(response))
        .catch((error) => res.status(500).json({error}));
}