import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import Query from "../../../modules/classes/query";




async function getHandler() {
    return new Query(
        'surtrics.surplus_metrics_data',
        [
            `COUNT(*) as count`,
            `date_trunc('day',transaction_date) as date_of_transaction`
        ],
    )
        .addWhere('transaction_type','=','skillAssessment')
        .join('nfs.surtrics.score_table s','LEFT',' s.id = surtrics.surplus_metrics_data.id')
        .addGroupBy('date_of_transaction')
        .run(db,console.log)
        .then(({rows})=> rows)

}

async function postHandler(req) {
    let body = parseBody(req);
    return new Query(
        'surtrics.surplus_metrics_data',
        ['*']
    )
        .addWhere('transaction_type','=','SkillAssessment')
        .join('nfs.surtrics.score_table s','LEFT',' s.id = surtrics.surplus_metrics_data.id')
        .conditional(body.startDate,
            (q)=> q.addWhere('transaction_date','>=',body.startDate),
            ()=>{}
        )
        .conditional(body.endDate,
            (q)=> q.addWhere('transaction_date','<=',body.endDate),
            ()=>{}
        )
        .conditional(body.error_type,
            (q)=> q.addWhere('error_type','=',body.error_type),
            ()=>{}
        )
        .conditional(body.date,
            (q)=> q.addWhere('date_trunc(\'day\',transaction_date)','=',body.date),
            ()=>{}
        )
        .conditional(body.name,
            (q)=> q.addWhere('user','=',body.name),
            ()=>{}
        )
        .conditional(body.id,
            (q)=> q.addWhere('s.id','=',body.id),
            ()=>{}
        )
        .run(db,console.log)
        .then(({rows})=> rows)
}



export default function handler(req, res) {
    return router({
        GET: getHandler,
        POST: postHandler
    })(req, res)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}