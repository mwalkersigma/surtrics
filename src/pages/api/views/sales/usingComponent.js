import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db";
import Query from "../../../../modules/classes/query";

async function getComponents(req,res) {


    await db.query(`
        WITH orders AS (
            SELECT 
                orders.order_id,     
                sales.sku           as sku,      
                sales.quantity_sold as quantity_sold,            
                sales.sold_price
            FROM sursuite.orders
                INNER JOIN sursuite.sales ON orders.order_id = sales.order_id
            WHERE 
                payment_date_utc >= $1
                AND payment_date_utc <= $2
        )
        SELECT components.sku,
               retail_price,
               quantity,
               SUM(orders.quantity_sold) as quantity_sold,
               cost,
               orders.sold_price
        FROM 
            sursuite.components
        LEFT JOIN orders ON components.sku = orders.sku
        GROUP BY 
            components.sku,
            orders.sold_price,
            quantity_sold
        ORDER BY 
            components.sku ASC;
    `,['2023-01-01','2023-12-31'])
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
