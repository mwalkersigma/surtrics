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


export default function handler (req, res) {
    return router({
        PUT: putHandler,
    })(req, res)

}