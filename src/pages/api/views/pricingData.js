import db from "../../../db";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import Query from "../../../modules/classes/query";



async function getHandler(req,res){
    const query = new Query('surtrics.surplus_pricing_data',['*']);
    return query
        .run(db,console)
        .then(({rows})=>res.status(200).json(rows))
}

async function postHandler(req,res){
    const body = parseBody(req);
    const baseQuery = new Query(
        'sursuite.components',
        [
            'date_priced_utc as date_priced',
            'priced_by as user_who_priced',
            'sku'
        ],
    ).conditional(
        body.startDate && body.endDate,
        (q)=> q
            .addWhere('date_priced_utc','>=',body.startDate)
            .addWhere('date_priced_utc','<=',body.endDate),
            (q)=> q
                .conditional(body.startDate || body.endDate,
                    (q)=> q.conditional(body.startDate,
                        (q)=> q.addWhere('date_priced_utc','>=',body.startDate),
                        (q)=> q.addWhere('date_priced_utc','<=',body.endDate)
                    ),
                    ()=> null,
                )
    )

    return await baseQuery
        .run(db,console)
        .then(({rows})=>res.status(200).json(rows))
}



export default router({
    GET:getHandler,
    POST:postHandler
})