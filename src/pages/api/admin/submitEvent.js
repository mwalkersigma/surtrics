import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import db from "../../../db/index.js";

export default function handler (req,res) {
    return serverAdminWrapper(async (req) => {
        console.log("req.body",req.body);
        let body = req.body;
        if(typeof body ==="string") body = JSON.parse(body);
        const {event_name,event_date,event_notes,affected_categories,user_who_submitted} = body;
        return db.query(`
        INSERT INTO surtrics.surplus_event_data (event_name, event_date, event_notes, affected_categories, user_who_submitted)
        VALUES ($1,$2,$3,$4,$5);
        `,[event_name,event_date,event_notes,affected_categories,user_who_submitted])
    },"bsa","surplus director")(req,res)
        .then(response=>{
            console.log("response",response);
            return res.status(200).json(response)
        })
        .catch((err)=>res.status(500).json({err}))

}