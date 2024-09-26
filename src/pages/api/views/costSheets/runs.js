import router from "../../../../modules/serverUtils/requestRouter";
import {startOfYear} from "date-fns";
import Query from "../../../../modules/classes/query";
import db from "../../../../db";

export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate ?? startOfYear(new Date());
        const endDate = queryParams?.endDate;
        const timeScale = queryParams?.timeScale ?? 'day';

        let query = new Query("nfs.surtrics.drive_parser_runs", [
            "*",
        ])
            .conditional(
                startDate && endDate,
                (query) =>
                    query.conditional(
                        startDate === endDate,
                        (q) => q.addWhere('start_date', '>=', startDate).addWhere('end_date', '<=', endDate),
                        (q) => q.addWhere("start_date", ">=", startDate).addWhere("end_date", "<=", endDate)
                    ),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere("start_date", ">=", startDate),
                () => null
            );

        const result = await query.run(db).then(({rows}) => rows);
        return res.status(200).json(result);


    },
})