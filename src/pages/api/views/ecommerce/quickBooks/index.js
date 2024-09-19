import router from "../../../../../modules/serverUtils/requestRouter";
import {startOfYear} from "date-fns";
import Query from "../../../../../modules/classes/query";
import db from "../../../../../db";


export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate ?? startOfYear(new Date());
        const endDate = queryParams?.endDate;
        const timeScale = queryParams?.timeScale ?? 'day';

        const query = new Query(
            "surtrics.surplus_quickbooks_data",
            [
                "COUNT(*) as po_count",
                "AVG(purchase_total) as po_avg",
                "SUM(purchase_total) as po_total",
            ]
        )
            .addAggregate("DATE_TRUNC('@',po_date) as po_date", timeScale || 'day')
            .conditional(
                startDate && endDate,
                (query) => query.conditional(startDate === endDate,
                    (q) => q
                        .addWhere("DATE_TRUNC('day',po_date)", '=', startDate.split("T")[0])
                    ,
                    (q) => q
                        .addWhere('po_date', '>=', startDate)
                        .addWhere('po_date', '<=', endDate),
                ),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere("po_date", ">=", startDate),
                () => null
            )
            .addGroupBy("po_date");
        let results = await query.run(db).then(({rows}) => rows)


        return res.status(200).json(results);
    },
})