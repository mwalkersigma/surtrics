import router from "../../../modules/utils/requestRouter";
import db from "../../../db/index"
import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";

function parseBody(req) {
    let body = req.body;
    if(typeof body === 'string') {
        body = JSON.parse(body)
    }
    return body;

}
function putHandler(req, res) {
    let body = parseBody(req);
    const { impressions, page_views, date_for_week} = body;
    return db.query(`
        INSERT INTO surtrics.surplus_ebay_data (impressions, page_views, date_for_week)
        VALUES ($1, $2, $3)
    `,[impressions, page_views, date_for_week])
        .then(() => {
            res.status(200).json({message:"Successfully added data"});
        })
        .catch((error) => {
            res.status(500).json({error});
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
                res.status(500).json({error});
            });

    })(req,res)
}
function deleteHandler(req, res) {
    return serverAdminWrapper((req,res)=> {
        return db.query(`
            DELETE
            FROM surtrics.surplus_ebay_data
            WHERE entry_id = $1
        `, [parseBody(req).id])
            .then(() => {
                res.status(200).json({message: "Successfully deleted data"});
            })
            .catch((error) => {
                res.status(500).json({error});
            });
    })(req,res)
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
                res.status(200).json({message:"Successfully updated data"});
            })
            .catch((error) => {
                res.status(500).json({error});
            });
    })(res,req)
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