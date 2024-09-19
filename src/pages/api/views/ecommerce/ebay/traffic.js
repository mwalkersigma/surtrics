import router from "../../../../../modules/serverUtils/requestRouter";
import Query from "../../../../../modules/classes/query";
import {startOfYear} from "date-fns";
import db from "../../../../../db";

export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate ?? startOfYear(new Date());
        const endDate = queryParams?.endDate;
        const timeScale = queryParams?.timeScale ?? 'day';

        let query = new Query("surtrics.surplus_ebay_data", [
            "sum(impressions::DECIMAL) as Impressions",
            "sum(page_views::DECIMAL) as PageViews",
        ])
            .addAggregate("DATE_TRUNC('@', date_for_week) as date_for_week", timeScale)
            .addGroupBy("date_for_week")
            .conditional(
                startDate && endDate,
                (query) =>
                    query.conditional(
                        startDate === endDate,
                        (q) => q.addWhere("DATE_TRUNC('day', date_for_week)", "=", startDate.split("T")[0]),
                        (q) =>
                            q
                                .addWhere("date_for_week", ">=", startDate.split("T")[0])
                                .addWhere("date_for_week", "<=", endDate.split("T")[0])
                    ),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere("date_for_week", ">=", startDate),
                () => null
            );

        const result = await query.run(db, console.log).then(({rows}) => rows);
        return res.status(200).json(result);


    },
})