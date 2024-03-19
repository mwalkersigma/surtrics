import db from "../../../../db/index"
import router from "../../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../../modules/serverUtils/parseBody";
import Query from "../../../../modules/classes/query";




async function postHandler (req,res) {
    let body = parseBody(req);
    let query = new Query("surtrics.surplus_metrics_data",[
        `sum(quantity)`,
        `"user" as name`,
        `transaction_type as type`,
    ])
        .conditional(body.date,
            (q)=>q.addWhere('transaction_date','>=',body.date),
            ()=>null
        )
        .conditional(body.startDate && body.endDate,
            (q)=>q.addWhere('transaction_date','>=',body.startDate)
                .addWhere('transaction_date','<=',body.endDate),
            ()=>null
        )
        .addWhere(`"user"`, `!=`, 'BSA')
        .addWhere('transaction_type', '=', 'Add')
        .addWhereWithOr([
            {column:'transaction_reason',operator:'=',value:'Relisting'},
            {column:'transaction_reason',operator:'=',value:'Add'},
            {column:'transaction_reason',operator:'=',value:'Add on Receiving'},
        ],'AND')
        .addGroupBy("name")
        .addGroupBy("type")
        .addGroupBy("date")
        .addOrderBy("date",'ASC')
        .conditional(body.interval,
            (q)=>q.addAggregate(`DATE_TRUNC('@', transaction_date) as date`,body.interval),
            (q)=>q.addColumn(`DATE_TRUNC('week',transaction_date) as date`)
        )
    return db.query(query.query, query.params)
        .then((response) => {
            res.status(200).json(response.rows)
        })
        .catch((error) => {
            res.status(500).json(error)
        })


}


export default router({
    POST:postHandler
})

