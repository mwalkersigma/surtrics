import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db";
import Query from "../../../../modules/classes/query";


async function getSalesWithOptions(req, res) {
    let params = req.query;


    let query = new Query(
        'sursuite.sales s',
        [
            's.sku',
            's.name',
            'c.title as model',
            'SUM(quantity_sold) as quantity_sold',
            'SUM( quantity_sold * sold_price) as total_sales',
            'COUNT(DISTINCT o.order_uid) as order_count',
            'c.title IS NOT NULL as has_component',
            // 'orders.name',
            // 'orders.store_id',
            // 'array_agg(s.sale_id) AS sale_ids',
            // 'array_agg(s.sku) AS skus',
            // 'array_agg(s.name) AS names',
            // 'array_agg(s.quantity_sold) AS quantities_sold',
            // 'array_agg(s.sold_price) AS sold_prices',
        ]
    )
        .join('sursuite.orders o', 'INNER', 's.order_uid = o.order_uid')
        .join('sursuite.components c', 'LEFT', 's.sku = c.sku')

        .addGroupBy('s.sku')
        .addGroupBy('s.name')
        .addGroupBy('c.title')
        .conditional(
            params.startDate && params.endDate,
            (query) => query.conditional(params.startDate === params.endDate,
                (q) => q
                    .addWhere("DATE_TRUNC('day',o.payment_date_utc)", '=', params.startDate.split("T")[0])
                ,
                (q) => q
                    .addWhere('o.payment_date_utc', '>=', params.startDate)
                    .addWhere('o.payment_date_utc', '<=', params.endDate),
            ),
            () => null
        )
        .conditional(
            params.startDate && !params.endDate,
            (query) => query.addWhere("o.payment_date_utc", ">=", params.startDate),
            () => null
        )
        .conditional(
            !params.startDate && params.endDate,
            (query) => query.addWhere('o.payment_date_utc', '<=', params.endDate),
            () => null
        )

    let { rows } = await db.query(query.query, query.params);
    return res.status(200).json(rows)
}


export default router({
    GET: getSalesWithOptions,
})
