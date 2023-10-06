import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import db from "../../../db/index.js";

export default function handler(req, res){
    return serverAdminWrapper(async (req,res,{user:{email}}) => {
        let queryString = `
        SELECT
            *
        FROM
            surtrics.surplus_metrics_data
        WHERE
            context = $1
            AND transaction_type = 'Error'`;
        const params = [email];
        let hasDate;
        if(req.body.length > 0){
            hasDate = JSON.parse(req.body)?.date;
        }
        if (hasDate) {
            queryString += `AND DATE(transaction_date) = $2;`;
            params.push(hasDate);
        }
        const query = await db.query(queryString, params);
        return query.rows;
    })(req,res)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        });
}