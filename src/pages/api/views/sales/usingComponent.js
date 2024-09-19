import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db";

async function getComponents(req,res) {
    const query = req.query;
    const startDate = query?.startDate ?? new Date('2023-01-01');
    const endDate = query?.endDate ?? new Date('2023-12-31');


    await db.query(`
        WITH annual_sales AS (SELECT orders.order_id,
                                     sales.sku           as sku,
                                     sales.quantity_sold as quantity_sold,
                                     sales.sold_price
                              FROM sursuite.orders
                                       INNER JOIN sursuite.sales ON orders.order_id = sales.order_id
                              WHERE payment_date_utc >= $1
                                AND payment_date_utc <= $2)
        SELECT components.sku,
               retail_price,
               quantity,
               SUM(a.quantity_sold) as quantity_sold,
               cost,
               a.sold_price
        FROM sursuite.components
                 LEFT JOIN annual_sales a ON components.sku = a.sku
        GROUP BY components.sku,
                 a.sold_price,
                 quantity_sold
        ORDER BY components.sku;
    `, [startDate, endDate])
        .then((data) => {
            res.json(data.rows)
        })
        .catch((error) => {
            res.json(error)
        })


}

async function postHandler(req,res) {}



export default router({
    GET: getComponents,
})
