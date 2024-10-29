import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db/index";
import Query from "../../../../modules/classes/query";
import * as perf_hooks from "node:perf_hooks";


export default router({
    GET: async (req, res) => {
        perf_hooks.performance.mark("start")
        // get route params
        const params = req.query;
        let sales = await new Query(
            "sursuite.orders o",
            ["*"]
        )
            .join("sursuite.sales s", 'LEFT', "s.order_id = o.order_id")
            .join("sursuite.components c", "LEFT", "s.sku = c.sku")
            .join("surtrics.surplus_metrics_data smd", "LEFT", "s.sku = smd.sku")
            .addOrderBy("o.order_id", "DESC")
            .conditional(params?.startDate,
                (q) => q
                    .addWhere("o.payment_date_utc", ">=", params.startDate)
                ,
                () => {
                }
            )
            .conditional(params?.endDate,
                (q) => q
                    .addWhere("o.payment_date_utc", "<=", params.endDate)
                ,
                () => {
                }
            )
            .run(db, console.log);
        console.log("Query Complete")
        perf_hooks.performance.mark("end")
        console.log("-------------------------")
        console.log("Query Took : ");
        console.log(perf_hooks.performance.measure("Query Time", "start", "end").duration / 1000)

        return res.status(200).json(sales.rows)
    }
});