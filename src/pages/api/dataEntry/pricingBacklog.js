import  router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index"
import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import {parseBody} from "../../../modules/serverUtils/parseBody";

function getHandler(req, res) {
    return serverAdminWrapper((req, res,{user:{name}}) => {
        return db.query(`
            SELECT 
                * 
            FROM 
                surtrics.surplus_pricing_backlog
            WHERE
                user_who_entered = $1
        `,[name])
            .then((data) => {
                res.status(200).json(data.rows);
            })
            .catch((error) => {
                res.status(500).json(error);
            });

    },"bsa","surplus director")(req,res)
}
function putHandler(req, res) {
    return serverAdminWrapper(async (req)=>{
        let body = parseBody(req);
        const {pricing_backlog,user_who_submitted,date_submitted} = body;
        return db.query(`
        INSERT INTO surtrics.surplus_pricing_backlog (count, user_who_entered,date_entered) 
        VALUES ($1,$2,$3)
        `,[pricing_backlog,user_who_submitted,date_submitted])
    },"bsa","surplus director")(req,res)
        .then((response) => {
            res.status(200).json({message:"Successfully added data",response});
        })
        .catch((error) => {
            res.status(500).json({error});
        });
}
function deleteHandler(req, res) {
    return serverAdminWrapper((req,res)=> {
        return db.query(`
            DELETE
            FROM surtrics.surplus_pricing_backlog
            WHERE entry_id = $1
        `, [parseBody(req)['entry_id']])
            .then(() => {
                res.status(200).json("Successfully deleted data");
            })
            .catch((error) => {
                res.status(500).json({error});
            });
    },"bsa","surplus director")(req,res)
}
export default function handler(req,res) {
    return router({
        PUT:putHandler,
        GET:getHandler,
        DELETE:deleteHandler
    })(req,res)
}