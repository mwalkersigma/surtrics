import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import Logger from "sigma-logger";
import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";

async function getHandler(req,res,...options){
    return serverAdminWrapper(async (req,res,{user:{email}}) => {
        let queryString = `
        SELECT
            *
        FROM
            surtrics.surplus_metrics_data
        WHERE
            context = $1
            AND transaction_type = 'SkillAssessment'`;
        const params = [email];
        const query = await db.query(queryString, params);
        let rows = query.rows;
        for (let row of rows) {
            const {id} = row;
            const {rows} = await db.query(`
                SELECT
                    *
                FROM
                    nfs.surtrics.score_table
                WHERE
                    id = $1;
            `,[id]);
            row.score = rows[0].score;
        }

        return rows;
    },...options)(req,res)
}
async function postHandler(req,res,...options){
    return serverAdminWrapper(async (req,res,{user:{email}}) => {
        let queryString = `
        SELECT
            *
        FROM
            surtrics.surplus_metrics_data
        WHERE
            context = $1
            AND transaction_type = 'SkillAssessment'
            AND DATE(transaction_date) = $2;`;
        const params = [email];
        let hasDate = JSON.parse(req.body)?.date;
        if (hasDate) {
            queryString += ``;
            params.push(hasDate);
        }
        const query = await db.query(queryString, params);
        let rows = query.rows;
        for (let row of rows) {
            const {id} = row;
            const {rows} = await db.query(`
                SELECT
                    *
                FROM
                    nfs.surtrics.score_table
                WHERE
                    id = $1;
            `,[id]);
            row.score = rows[0].score;
        }
        return rows;
    },...options)(req,res)
}
async function putHandler(req,res,...options){
    return serverAdminWrapper(async (req) => {
        const body = JSON.parse(req.body);
        const {user,reason,notes,session:browserSession,date,score} = body;
        const {user:sessionUser} = browserSession;
        delete sessionUser.image;

        const {rows} = await db.query(`
            INSERT INTO 
                nfs.surtrics.surplus_metrics_data
                ("user", sku,code, scanned_code, lot_number, title, location, quantity, quantity_before, quantity_after, transaction_note, transaction_reason, transaction_type, serial_numbers, context, transaction_date)
            VALUES
             ($1,null,null,null,null,null,$6,null,null,null,$2,$3,'SkillAssessment',null,$4,$5)
            returning id
        `,[user,notes,reason,sessionUser.email,date,""]);

        let id = rows[0].id;

        await db.query(`
            INSERT INTO
                nfs.surtrics.score_table (id, score)
            VALUES
                ($1, $2)
        `,[id,score])
        
        const response = `Skill Assessment Reported Successfully: \n User: ${sessionUser.email}`
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
                surtrics.score_table
            WHERE
                id = $1;
        `,[id]);
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