import router from "../../../../modules/serverUtils/requestRouter";
import Query from "../../../../modules/classes/query";
import db from "../../../../db/index"
import {parseBody} from "../../../../modules/serverUtils/parseBody";

async function postHandler(req,res){
    let body = parseBody(req)
    const query = new Query(
        'surtrics.surplus_pricing_backlog',
        [
            "entry_id",
            'count',
            'user_who_entered',
            'date_entered',
        ]
    )
    .conditional(body.startDate && !body.endDate,
        (q)=>q.addWhere("DATE_TRUNC('day',date_entered)",'=',body.startDate),
        (q)=>null
    )
    .conditional(body.endDate && !body.startDate,
        (q)=>q.addWhere("DATE_TRUNC('day',date_entered)",'=',body.endDate),
        (q)=>null
    )
    .conditional(body.startDate && body.endDate,
        (q)=>q
            .addWhere("date_entered",'>=',body.startDate)
            .addWhere("date_entered",'<=',body.endDate)
        ,
        (q)=>null
    )



    let response = await query.run(db,console).then(({rows})=>rows);
    res.status(200).json(response);
}

export default router({
    GET: (req,res)=> res.status(200).json({message: "Route not implemented yet"}),
    POST: postHandler,
})