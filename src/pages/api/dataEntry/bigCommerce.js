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
                surtrics.surplus_big_commerce_data
            WHERE
                user_who_entered = $1
        `,[name])
            .then((data) => {
                res.status(200).json(data.rows);
            })
            .catch((error) => {
                res.status(500).json({error});
            });

    },"bsa","surplus director")(req,res)
}
function putHandler(req, res) {
    return serverAdminWrapper(async (req)=>{
        let body = parseBody(req);
        const {
            visits,
            shopped,
            add_to_cart,
            web_leads,
            date_for_week,
            user_who_submitted
        } = body;
        return db.query(`
        INSERT INTO surtrics.surplus_big_commerce_data (visits, shopped, add_to_cart, web_leads, date_for_week, user_who_entered) 
        VALUES ($1, $2, $3, $4, $5, $6)
        `,[visits, shopped,add_to_cart, web_leads, date_for_week, user_who_submitted ])
    },"bsa","surplus director")(req,res)
        .then((response) => {
            console.log(response)
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
            FROM surtrics.surplus_big_commerce_data
            WHERE entry_id = $1
        `, [parseBody(req).id])
            .then(() => {
                res.status(200).json({message: "Successfully deleted data"});
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