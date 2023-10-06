import db from "../../../db/index.js";
import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";

function main(req,res) {
    return serverAdminWrapper(async (req) => {
        const body = JSON.parse(req.body);
        const {id} = body;
        await db.query(`
            DELETE FROM
                surtrics.surplus_metrics_data
            WHERE
                id = $1;
        `,[id]);
        return `Success! ID ${id} was removed.`;
    })(req,res)
        .then((response) => response )
        .catch((error) => error )
}

export default function handler (req, res) {
    return main(req,res)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        });
}