import router from "../../../../modules/serverUtils/requestRouter";
import Query from "../../../../modules/classes/query";
import db from "../../../../db";

export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate;
        const endDate = queryParams?.endDate;
        const success = queryParams?.success ?? true;

        let query = new Query(
            'nfs.logs.quotes_sent qs',
            [
                "quote_id",
                "customer",
                "enumber",
                "qs.sales_opp_id",
                "sales_rep",
                "sale_price",
                "qs.created_at",
                "ird.entry_id"
            ]
        )
            .conditional(success,
                (q) => q.join('nfs.incentive_app.incentive_raw_data ird', 'INNER', 'qs.sales_opp_id = ird.sales_opp_id'),
                (q) => q.join('nfs.incentive_app.incentive_raw_data ird', 'LEFT', 'qs.sales_opp_id = ird.sales_opp_id')
            )
            .conditional(startDate && endDate,
                (query) => query
                    .addWhere('created_at', '>=', startDate)
                    .addWhere('created_at', '<=', endDate),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere('qs.created_at', '>=', startDate),
                () => null
            )

        const result = await query.run(db, console.log).then(({rows}) => rows);

        return res.status(200).json(result);
    }
})