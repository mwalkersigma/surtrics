import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index"

function parseBody(req) {
    let body = req.body;
    if(typeof body === 'string') {
        body = JSON.parse(body)
    }
    return body;

}
function getHandler(req,res){
    return serverAdminWrapper(async (req,res,{user:{name}}) => {
        return db.query(`
            SELECT
                *
            FROM
                surtrics.surplus_event_data
            WHERE
                user_who_submitted = $1
        `,[name])
    },"bsa","surplus director")(req,res)
        .then(({rows})=>{
            res.status(200).json(rows)
        })
        .catch((err)=>res.status(500).json({message:"Error",err}))

}
function putHandler(req,res){
    return serverAdminWrapper(async (req) => {
        let body = req.body;
        if(typeof body ==="string") body = JSON.parse(body);
        const {event_name,event_date,event_notes,affected_categories,user_who_submitted} = body;
        return db.query(`
        INSERT INTO surtrics.surplus_event_data (event_name, event_date, event_notes, affected_categories, user_who_submitted)
        VALUES ($1,$2,$3,$4,$5);
        `,[event_name,event_date,event_notes,affected_categories,user_who_submitted])
    },"bsa","surplus director")(req,res)
        .then((response)=>{
            let message = "Success! Event was submitted."
            res.status(200).json({message,response})
        })
        .catch((err)=>res.status(500).json({message:"Error",err}))
}
function deleteHandler (req,res) {
    return serverAdminWrapper(async (req) => {
        const body = parseBody(req)
        const {event_id} = body;
        return db.query(`
        DELETE FROM surtrics.surplus_event_data WHERE event_id = $1;
        `,[event_id])
    },"bsa","surplus director")(req,res)
        .then((response)=>{
            let message = "Success! Event was deleted."
            res.status(200).json(message)
        })
        .catch((err)=>res.status(500).json({message:"Error",err}))
}

export default function handler (req,res) {
    return router({
        GET:getHandler,
        PUT:putHandler,
        DELETE:deleteHandler
    })(req,res)
}