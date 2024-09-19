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

        let query = new Query(
            'sursuite.orders',
            [
                'orders.order_id',
                'orders.order_status',
                'orders.name',
                'orders.store_id',
                'array_agg(s.sale_id) AS sale_ids',
                'array_agg(s.sku) AS skus',
                'array_agg(s.name) AS names',
                'array_agg(s.quantity_sold) AS quantities_sold',
                'array_agg(s.sold_price) AS sold_prices',
            ]
        )
            .addAggregate("DATE_TRUNC('@',orders.payment_date_utc) as payment_date_utc", timeScale || 'day')
            .join('sursuite.sales s', 'INNER', 's.order_id = orders.order_id')
            .addWhere('orders.store_id', '=', 255895)
            .addGroupBy('orders.order_id')
            .addGroupBy('orders.payment_date_utc')
            .addGroupBy('orders.order_status')
            .addGroupBy('orders.name')
            .addGroupBy('orders.store_id')
            .conditional(
                startDate && endDate,
                (query) => query.conditional(startDate === endDate,
                    (q) => q
                        .addWhere("DATE_TRUNC('day',orders.payment_date_utc)", '=', startDate.split("T")[0])
                    ,
                    (q) => q
                        .addWhere('orders.payment_date_utc', '>=', startDate)
                        .addWhere('orders.payment_date_utc', '<=', endDate),
                ),
                () => null
            )
            .conditional(
                startDate && !endDate,
                (query) => query.addWhere("orders.payment_date_utc", ">=", startDate),
                () => null
            )

        const result = await query.run(db).then(({rows}) => rows);
        return res.status(200).json(result);
    }
})