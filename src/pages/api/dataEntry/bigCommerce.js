import router from "../../../modules/utils/requestRouter";
import db from "../../../db/index"

function parseBody(req) {
    let body = req.body;
    if(typeof body === 'string') {
        body = JSON.parse(body)
    }
    return body;

}
function putHandler(req, res) {
    let body = parseBody(req);
    const {
        visits,
        shopped,
        add_to_cart,
        date_for_week,
        user_who_submitted
    } = body;
    return db.query(`
        INSERT INTO surtrics.surplus_big_commerce_data (visits, shopped, add_to_cart, date_for_week, user_who_entered) 
        VALUES ($1, $2, $4, $5, $6)
    `,[visits, shopped, add_to_cart, date_for_week, user_who_submitted ])
        .then(() => {
            res.status(200).json({message:"Successfully added data"});
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