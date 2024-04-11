import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import Logger from "sigma-logger";
import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import Query from "../../../modules/classes/query";

async function getHandler(req,res,...options){
    return serverAdminWrapper(async (req,res,{user:{email}}) => {
        let query = new Query(
            'surtrics.surplus_metrics_data',
            ['*'],
        )
            .addWhere('context','=',email)
            .addWhere('transaction_type','=','Error')

        return  query.run(db,console.log).then(({rows})=>rows);
    },...options)(req,res)
}

async function postHandler(req,res,...options){
    return serverAdminWrapper(async (req,res,{user:{email}}) => {

        const body = parseBody(req)
        let hasDate = body?.date;

        const query = new Query('surtrics.surplus_metrics_data',['*'])
            .addWhere('context','=',email)
            .addWhere('transaction_type','=','Error')
            .conditional(
                hasDate,
                (query)=>query.addWhere('transaction_date','=',hasDate),
                ()=>{}
            )

        return query.run(db,console.log).then(({rows})=>rows);

    },...options)(req,res)
}

async function putHandler(req,res,...options){
    return serverAdminWrapper(async (req) => {
        const body = JSON.parse(req.body);
        const {user,reason,notes,session:browserSession,date,location} = body;
        const {user:sessionUser} = browserSession;
        delete sessionUser.image;
        await db.query(`
            INSERT INTO 
                nfs.surtrics.surplus_metrics_data
                ("user", sku,code, scanned_code, lot_number, title, location, quantity, quantity_before, quantity_after, transaction_note, transaction_reason, transaction_type, serial_numbers, context, transaction_date)
            VALUES
             ($1,null,null,null,null,null,$6,null,null,null,$2,$3,'Error',null,$4,$5)
        `,[user,notes,reason,sessionUser.email,date,location])
        const response = `Error Reported Successfully: \n User: ${sessionUser.email} reported an error for ${user} with reason: ${reason} and notes: ${notes}`
        Logger.log(response);
        return response
    },...options)(req,res)
}

async function deleteHandler(req,res,...options){
    return serverAdminWrapper(async (req) => {
        const body = JSON.parse(req.body);
        const {id} = body;
        if(!id) throw new Error("No ID provided");
        await db.query(`
            DELETE FROM
                surtrics.surplus_metrics_data
            WHERE
                id = $1;
        `,[id]);
        return `Success! ID ${id} was removed.`;
    },...options)(req,res)
}


export default function handler(req,res) {
    let authorizedRoles = ["surplus director","bsa",'warehouse','lister']
    return router({
        GET: getHandler,
        POST: postHandler,
        PUT: putHandler,
        DELETE: deleteHandler
    })(req,res,...authorizedRoles)
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((error) => {
        res.status(500).json(error);
    })
}