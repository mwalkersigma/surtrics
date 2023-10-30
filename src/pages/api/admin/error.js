import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import {subBusinessDays} from "date-fns";
import Logger from "sigma-logger";
import db from "../../../db/index";

async function getHandler(req,res,options){
    return serverAdminWrapper(async (req,res,{user:{email}}) => {
        let queryString = `
        SELECT
            *
        FROM
            surtrics.surplus_metrics_data
        WHERE
            context = $1
            AND transaction_type = 'Error'`;
        const params = [email];
        const query = await db.query(queryString, params);
        return query.rows;
    },options)(req,res)
}
async function postHandler(req,res,options){
    return serverAdminWrapper(async (req,res,{user:{email}}) => {
        let queryString = `
        SELECT
            *
        FROM
            surtrics.surplus_metrics_data
        WHERE
            context = $1
            AND transaction_type = 'Error'
            AND DATE(transaction_date) = $2;`;
        const params = [email];
        let hasDate = JSON.parse(req.body)?.date;
        if (hasDate) {
            queryString += ``;
            params.push(hasDate);
        }
        const query = await db.query(queryString, params);
        return query.rows;
    },options)(req,res)
}
async function putHandler(req,res,options){
    return await serverAdminWrapper(async (req) => {
        const body = JSON.parse(req.body);
        const {user,reason,notes,session:browserSession} = body;
        const {user:sessionUser} = browserSession;
        delete sessionUser.image;
        await db.query(`
            INSERT INTO 
                nfs.surtrics.surplus_metrics_data
                ("user", sku,code, scanned_code, lot_number, title, location, quantity, quantity_before, quantity_after, transaction_note, transaction_reason, transaction_type, serial_numbers, context, transaction_date)
            VALUES
             ($1,null,null,null,null,null,null,null,null,null,$2,$3,'Error',null,$4,$5)
        `,[user,notes,reason,sessionUser.email,subBusinessDays(new Date(),1)])
        const response = `Error Reporting: User: ${sessionUser.email} reported an error for ${user} with reason: ${reason} and notes: ${notes}`
        Logger.log(response);
        return response
    },options)(req,res)
}

async function deleteHandler(req,res,options){
    return serverAdminWrapper(async (req) => {
        const body = JSON.parse(req.body);
        const {id} = body;
        await db.query(`
            DELETE FROM
                surtrics.surplus_metrics_data
            WHERE
                id = $1;
        `,[id]);
        return `Success! ID ${id} was removed.`;
    },options)(req,res)
}

export default function handler(req,res) {
    let {method} = req;
    let call;
    switch (method) {
        case "GET":
            call = getHandler(req,res,"bsa");
            break;
        case "POST":
            call = postHandler(req,res,"bsa");
            break;
        case "PUT":
            call = putHandler(req,res,"bsa");
            break;
        case "DELETE":
            call = deleteHandler(req,res,"bsa");
            break;
        default:
            call = Promise.resolve({error: "Method not allowed"});
            break;
    }
    return call
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((error) => {
        res.status(500).json({error});
    })
}