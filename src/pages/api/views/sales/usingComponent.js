import router from "../../../../modules/serverUtils/requestRouter";
import db from "../../../../db";
import Query from "../../../../modules/classes/query";

async function getComponents(req,res) {
    let query = new Query(
        'sursuite.components',
        [
            'components.sku',
            'retail_price',
            'quantity',
            'quantity_sold',
            'cost',
            'sold_price'
        ]
    );
    query.join('surplusapi.approved_templates a','LEFT','SPLIT_PART(components.sku,\'-\',1) = a.inventory_sku::text ');
    query.join('sursuite.sales s','LEFT','components.sku = s.sku ');
    query.join('sursuite.orders o','LEFT OUTER','o.order_id = s.order_id ');
    query.addWhere('o.payment_date_utc','>=', '2023-01-01');
    query.addWhere('o.payment_date_utc','<=', '2023-12-31');

    console.log(query.getParsedQuery())

    await db.query(query.query,query.params)
        .then((data) => {
            console.log(data)
            res.json(data.rows)
        })
        .catch((error) => {
            console.log(error)
            res.json(error)
        })


}

async function postHandler(req,res) {}



export default router({
    GET: getComponents,
})
