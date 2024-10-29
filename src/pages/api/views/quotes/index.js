import router from "../../../../modules/serverUtils/requestRouter";
import {startOfYear} from "date-fns";
import Query from "../../../../modules/classes/query";
import db from "../../../../db";


export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate ?? startOfYear(new Date());
        const endDate = queryParams?.endDate;

        let query = new Query(
            'nfs.logs.quotes_sent',
            [
                '*'
            ]
        )
            .conditional(startDate && endDate,
                (query) => query
                    .addWhere('created_at', '>=', startDate)
                    .addWhere('created_at', '<=', endDate),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere('created_at', '>=', startDate),
                () => null
            )

        const result = await query.run(db).then(({rows}) => rows);
        return res.status(200).json(result);
    }
})