import serverAdminWrapper from "../../../modules/utils/serverAdminWrapper";
import db from "../../../db/index.js";

export default function handler(req, res){
    return serverAdminWrapper(async (req,res,{user:{email}}) => {
        const query = await db.query(`
        SELECT
            *
        FROM
            surtrics.surplus_metrics_data
        WHERE
            context = $1
            AND transaction_type = 'Error';
        `,[email]);
        return query.rows;
    })(req,res)
        .then((response) => {
            console.log(response)
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        });
}