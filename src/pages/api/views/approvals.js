import db from "../../../db";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import router from "../../../modules/serverUtils/requestRouter";
import Query from "../../../modules/classes/query";

async function getIncrements(req,res){
    let body = parseBody(req);
    const {startDate,endDate,increment} = body;
    let query = new Query("sursuite.components", [
        `COUNT(*)`,
        `final_approval_by as name`,
    ])
        .addWhere(`final_approval_by`, `!=`, 'undefined')
        .addWhere('final_approval_date_utc', '>=', startDate)
        .addWhere('final_approval_date_utc', '<=', endDate)
        .addGroupBy("name")
        .addGroupBy("final_approval_date_utc")
        .addOrderBy("final_approval_date_utc", 'ASC')
        .conditional(body.increment,
            (q) => q.addAggregate(`DATE_TRUNC('@', final_approval_date_utc) as date_of_final_approval`, increment),
            (q) => q.addColumn(`DATE_TRUNC('week',final_approval_date_utc) as date_of_final_approval`)
        )

    let results = await query.run(db, console.log);
    console.log(results.rows)
    return results.rows;
}


export default function handler (req,res) {
    return router({
        POST:getIncrements
    })(req,res)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })

}