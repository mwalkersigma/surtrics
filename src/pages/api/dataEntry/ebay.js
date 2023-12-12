import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index"
import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import {parseBody} from "../../../modules/serverUtils/parseBody";

function putHandler(req, res) {
    return serverAdminWrapper((req, res,{user:{name}}) => {
        let body = parseBody(req);
        const {impressions, page_views, date_for_week} = body;
        return db.query(`
            INSERT INTO surtrics.surplus_ebay_data (impressions, page_views, date_for_week, user_who_entered)
            VALUES ($1, $2, $3, $4)
        `, [impressions, page_views, date_for_week, name])
    },"bsa","surplus director")(req,res)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => {
            res.status(500).json(error);
        });
}
function getHandler(req, res) {
    return serverAdminWrapper((req, res,{user:{name}}) => {
        return db.query(`
            SELECT 
                * 
            FROM 
                surtrics.surplus_ebay_data
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
function deleteHandler(req, res) {
    return serverAdminWrapper((req,res)=> {
        return db.query(`
            DELETE
            FROM surtrics.surplus_ebay_data
            WHERE entry_id = $1
        `, [parseBody(req)['entry_id']])
            .then(() => {
                res.status(200).json("Successfully deleted data");
            })
            .catch(() => {
                res.status(500).json("There was an error deleting data");
            });
    },"bsa","surplus director")(req,res)
}
function patchHandler(req,res){
    return serverAdminWrapper((req,res) => {
        const body = parseBody(req);
        const {id,field,value} = body;
        return db.query(`
            UPDATE surtrics.surplus_ebay_data
            SET ${field} = $1
            WHERE entry_id = $2
        `,[value,id])
            .then(() => {
                res.status(200).json("Successfully updated data");
            })
            .catch((error) => {
                res.status(500).json(error);
            });
    },"bsa","surplus director")(res,req)
}

export default function handler (req, res) {
    return router({
        PUT: putHandler,
        GET: getHandler,
        POST : getHandler,
        DELETE: deleteHandler,
        PATCH: patchHandler,
    })(req, res)

}