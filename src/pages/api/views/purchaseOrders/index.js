import Query from "../../../../modules/classes/query";
import db from "../../../../db/index";
import router from "../../../../modules/serverUtils/requestRouter";


export default router({
    GET: async (req, res) => {
        const queryParams = req?.query

        const rows = await new Query("nfs.sursuite.purchase_orders", ["*"])
            .conditional(
                queryParams?.startDate,
                (q) => q.addWhere("created_date", ">", queryParams.startDate),
                (q) => q.addWhere("created_date", ">", "2024-01-01")
            )
            .run(db).then(res => res.rows);

        res.json(rows);
    }
})