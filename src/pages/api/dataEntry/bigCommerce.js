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

    return serverAdminWrapper(async (req,res)=>{
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
        `,[visits, shopped,web_leads, add_to_cart, date_for_week, user_who_submitted ])
    },"bsa","surplus director")(req,res)
        .then((response) => {
            console.log(response)
            res.status(200).json({message:"Successfully added data",response});
        })
        .catch((error) => {
            res.status(500).json({error});
        });
}

export default function handler(req,res) {
    return router({
        PUT:putHandler
    })(req,res)
}