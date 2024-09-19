import db from "../../../../db";
import router from "../../../../modules/serverUtils/requestRouter";
import {startOfYear} from "date-fns";
import Query from "../../../../modules/classes/query";

export default router({
    GET: async (req, res) => {
        const queryParams = req.query;

        const startDate = queryParams?.startDate ?? startOfYear(new Date());
        const endDate = queryParams?.endDate;
        const timeScale = queryParams?.timeScale ?? 'day';

        let query = new Query(
            'surtrics.surplus_metrics_data',
            [
                'COUNT(*)',
                'transaction_reason',
            ]
        )
            .addAggregate("DATE_TRUNC('@',transaction_date) as date_of_transaction", timeScale)
            .conditional(
                startDate && endDate,
                (query) => query.conditional(startDate === endDate,
                    (q) => q
                        .addWhere("DATE_TRUNC('day',transaction_date)", '=', startDate.split("T")[0])
                    ,
                    (q) => q
                        .addWhere('transaction_date', '>=', startDate.split("T")[0])
                        .addWhere('transaction_date', '<=', endDate.split("T")[0]),
                ),
                () => null
            )
            .conditional(startDate && !endDate,
                (query) => query.addWhere('transaction_date', '>=', startDate.split("T")[0]),
                () => null
            )
            .conditional(
                !startDate && endDate,
                (query) => query.addWhere('transaction_date', '<=', endDate.split("T")[0]),
                () => null
            )
            .addGroupBy('date_of_transaction')
            .addGroupBy('transaction_reason')
            .addAdHocWhere(`
                (
                    transaction_type = 'Add'
                OR transaction_type = 'Remove'
                        AND transaction_reason = 'Relisting'
            )
          AND (
                    transaction_reason = 'Add'
                OR transaction_reason = 'Add on Receiving'
                OR transaction_reason = 'Relisting'
            )`)

        const result = await query.run(db, console.log).then(({rows}) => rows);
        return res.status(200).json(result);
    }
})