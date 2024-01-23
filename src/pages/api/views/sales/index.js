import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db";
import {parseBody} from "../../../../modules/serverUtils/parseBody";
import Query from "../../../../modules/classes/query";


async function getSales(req,res) {
    let query = `SELECT * FROM surtrics.surplus_sales_data`;
    let {rows} = await db.query(query);
    return res.status(200).json(rows)
}
async function getSalesWithOptions(req,res) {
    let body = parseBody(req);

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
        .addAggregate("DATE_TRUNC('@',orders.payment_date_utc) as payment_date_utc",body.timeScale || 'day')
        .join('sursuite.sales s', 'INNER', 's.order_id = orders.order_id')
        .addGroupBy('orders.order_id')
        .addGroupBy('orders.payment_date_utc')
        .addGroupBy('orders.order_status')
        .addGroupBy('orders.name')
        .addGroupBy('orders.store_id')
        .conditional(
            body.startDate && body.endDate,
            (query) => query.conditional(body.startDate === body.endDate,
                (q) => q
                    .addWhere("DATE_TRUNC('day',orders.payment_date_utc)", '=', body.startDate.split("T")[0])
                    ,
                (q) => q
                    .addWhere('orders.payment_date_utc', '>=', body.startDate)
                    .addWhere('orders.payment_date_utc', '<=', body.endDate),
            ),
            ()=>null
        )
        .conditional(
            body.startDate && !body.endDate,
            (query) => query.addWhere("orders.payment_date_utc", ">=", body.startDate),
            ()=>null
        )
        .conditional(
            !body.startDate && body.endDate,
            (query) => query.addWhere('orders.payment_date_utc', '<=', body.endDate),
            ()=>null
        )

    let {rows} = await db.query(query.query, query.params);
    return res.status(200).json(rows)
}


export default router({
    GET: getSales,
    POST: getSalesWithOptions
})
