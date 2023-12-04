import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db";

async function getEvents(req,res){

    return await db.query(`
        SELECT
            *
        FROM
            surtrics.surplus_event_data;
    `)
        .then(({rows}) => rows)
}

export default function handler(req,res) {
    return router({
        GET: getEvents
    })(req,res)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}