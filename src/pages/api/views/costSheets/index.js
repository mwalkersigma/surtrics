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

        let query = new Query(
            'nfs.surtrics.surplus_po_sheets',
            [
                '*'
            ]
        )
            .addWhere('po_creation_status', '=', false)
            .isNotNull('sheet_failure_reason')

        // .addWhere('orders.store_id', '=', 225004)
        // .addGroupBy('orders.order_id')
        // .addGroupBy('orders.payment_date_utc')
        // .addGroupBy('orders.order_status')
        // .addGroupBy('orders.name')
        // .addGroupBy('orders.store_id')
        // .conditional(
        //     startDate && endDate,
        //     (query) => query.conditional(startDate === endDate,
        //         (q) => q
        //             .addWhere("DATE_TRUNC('day',orders.payment_date_utc)", '=', startDate.split("T")[0])
        //         ,
        //         (q) => q
        //             .addWhere('orders.payment_date_utc', '>=', startDate)
        //             .addWhere('orders.payment_date_utc', '<=', endDate),
        //     ),
        //     () => null
        // )
        // .conditional(
        //     startDate && !endDate,
        //     (query) => query.addWhere("orders.payment_date_utc", ">=", startDate),
        //     () => null
        // )

        const result = await query.run(db).then(({rows}) => rows);
        return res.status(200).json(result);
    }
})