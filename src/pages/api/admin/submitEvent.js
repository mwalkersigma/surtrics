import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import db from "../../../db/index.js";

export default function handler (req,res) {
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