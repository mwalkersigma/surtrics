import {getServerSession} from "next-auth";
import {auth} from "../auth/[...nextauth]";
import db from "../../../db/index.js";
import fs from "fs/promises";
import Logger from "sigma-logger";
import serverAdminWrapper from "../../../modules/utils/serverAdminWrapper";



// if the auth properly resolves the CB is called with the req,res,session


async function main (req,res) {
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
        `,[user,notes,reason,sessionUser.email,new Date()])
        const response = `Error Reporting: User: ${sessionUser.email} reported an error for ${user} with reason: ${reason} and notes: ${notes}`
        Logger.log(response);
        return response
    })(req,res)
}

export default function handler (req, res) {
    return main(req,res)
        .then((response) => {
            if(response === "success") {
                res.status(200).json(response)
            }else {
                res.status(400).json(response)
            }
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}