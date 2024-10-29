import router from "../../../../modules/serverUtils/requestRouter";
import Query from "../../../../modules/classes/query";
import db from "../../../../db";


export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate;
        const endDate = queryParams?.endDate;

        let query = new Query(
            'nfs.surtrics.restock_notifications',
            [
                '*'
            ]
        )
            .conditional(startDate && endDate,
                (query) => query
                    .addWhere('notification_date', '>=', startDate)
                    .addWhere('notification_date', '<=', endDate),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere('notification_date', '>=', startDate),
                () => null
            )

        const result = await query.run(db).then(({rows}) => rows);
        return res.status(200).json(result);
    }
})