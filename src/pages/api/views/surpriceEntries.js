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
                .addWhere('dr.date_researched','>=',body.startDate)
                .addWhere('dr.date_researched','<=',body.endDate)
                .addGroupBy('ra.name')
                .addGroupBy('date')
                .addOrderBy('date','ASC')
                .addOrderBy('ra.name','ASC');

                query.conditional(body.interval,
                    ()=>query.addAggregate(`DATE_TRUNC('@', dr.date_researched) as date`,body.interval),
                    ()=>query.addColumn(`DATE_TRUNC('day',dr.date_researched) as date`)
                )


            const result = await db.query(query.query,query.params);
            const data = result.rows;

            res.status(200).json(data);
        },
})