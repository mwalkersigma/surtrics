import router from "../../../../modules/serverUtils/requestRouter";
import {startOfYear} from "date-fns";
import Query from "../../../../modules/classes/query";
import db from "../../../../db";


export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate ?? startOfYear(new Date());
        const endDate = queryParams?.endDate;

        const successes = queryParams?.success;
        const failures = queryParams?.failure;

        let query = new Query(
            'nfs.logs.processed_opp_ids',
            [
                '*'
            ]
        )
            .conditional(successes,
                (q) => q.addWhere('outcome', '=', 'folder generated'),
                () => null
            )
            .conditional(failures,
                (q) => q.addWhere('outcome', '!=', 'folder generated'),
                () => null
            )
            .conditional(startDate && endDate,
                (query) => query
                    .addWhere('processed_at', '>=', startDate)
                    .addWhere('processed_at', '<=', endDate),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere('processed_at', '>=', startDate),
                () => null
            )

        const result = await query.run(db).then(({rows}) => rows);
        return res.status(200).json(result);
    }
})