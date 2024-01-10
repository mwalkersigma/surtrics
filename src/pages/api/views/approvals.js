import db from "../../../db";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import router from "../../../modules/serverUtils/requestRouter";
import Query from "../../../modules/classes/query";
async function getIncrements(req,res){
    let body = parseBody(req);
    const {startDate,endDate,increment} = body;
    let query = new Query("surtrics.surplus_approvals",[
        `COUNT(*)`,
        `user_who_approved as name`,
    ])
        .addWhere(`user_who_approved`, `!=`, 'undefined')
        .addWhere('date_of_final_approval', '>=', startDate)
        .addWhere('date_of_final_approval', '<=', endDate)
        .addGroupBy("name")
        .addGroupBy("date_of_final_approval")
        .addOrderBy("date_of_final_approval",'ASC')
        .conditional(body.increment,
            (q)=>q.addAggregate(`DATE_TRUNC('@', date_of_final_approval) as date_of_final_approval`,increment),
            (q)=>q.addColumn(`DATE_TRUNC('week',date_of_final_approval) as date_of_final_approval`)
        )

    let results = await db.query(query.query,query.params);
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