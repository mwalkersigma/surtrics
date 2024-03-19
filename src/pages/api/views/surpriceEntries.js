import db from "../../../db/index";
import router from "../../../modules/serverUtils/requestRouter";
import Query from "../../../modules/classes/query";
import {parseBody} from "../../../modules/serverUtils/parseBody";

export default router({
    POST: async (req, res) => {
        const body = parseBody(req);
            const query = new Query(
                'models',
                [
                    'count(*) as count',
                    'ra.name as approver',
                ])
                .join('public.date_researched dr','INNER', 'models.research_id = dr.research_id ')
                .join('public.research_approver ra','INNER', 'models.research_id = ra.research_id ')

                .addGroupBy('ra.name')
                .addGroupBy('date')
                .addOrderBy('date','ASC')
                .addOrderBy('ra.name','ASC');

                query.conditional( body.startDate && !body.endDate ,
                    (q)=>q.addWhere('dr.date_researched','>=',body.startDate),
                    ()=>null
                )
                query.conditional( !body.startDate &&  body.endDate ,
                    (q)=>q.addWhere('dr.date_researched','<=',body.endDate),
                    ()=>null
                )
                query.conditional( body.startDate &&  body.endDate && body.startDate !== body.endDate,
                    (q)=> q
                        .addWhere('dr.date_researched','>=',body.startDate)
                        .addWhere('dr.date_researched','<=',body.endDate),
                    ()=>null
                )
                query.conditional( body.startDate &&  body.endDate && body.startDate === body.endDate,
                    (q)=> q
                        .addWhere("DATE_TRUNC('day',dr.date_researched)",'=',body.startDate.split('T')[0]),
                    ()=>null
                )
                query.conditional(body.interval,
                    (q)=>q.addAggregate(`DATE_TRUNC('@', dr.date_researched) as date`,body.interval),
                    (q)=>q.addColumn(`DATE_TRUNC('day',dr.date_researched) as date`)
                )


            const result = await db.query(query.query,query.params);
            const data = result.rows;

            res.status(200).json(data);
        },
})