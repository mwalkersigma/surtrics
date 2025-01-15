import router from "../../../../modules/serverUtils/requestRouter";
import {subDays} from "date-fns";
import Query from "../../../../modules/classes/query";
import db from "../../../../db";


export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate ?? subDays(new Date(), 365);
        const endDate = queryParams?.endDate;

        let query = new Query(
            'nfs.surtrics.surplus_po_sheets',
            [
                '*'
            ]
        )
            .addWhere('po_creation_status', '=', false)
            .isNotNull('sheet_failure_reason')
            .conditional(startDate && endDate,
                (query) => query
                    .addWhere('update_date', '>=', startDate)
                    .addWhere('update_date', '<=', endDate),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere('update_date', '>=', startDate),
                () => null
            )

        const result = await query.run(db).then(({rows}) => rows);
        return res.status(200).json(result);
    }
})