import router from "../../../../modules/serverUtils/requestRouter.js";
import Query from "../../../../modules/classes/query.js";
import db from "../../../../db/index.js";

async function listConsignmentAuctionOrders(req, res) {
    return await new Query('sursuite.components c', ['*'])
        .join('sursuite.sales s', 'INNER', 's.sku = c.sku')
        .join('sursuite.orders o', 'INNER', 'o.order_uid = s.order_uid')
        .addWhere('c.sku', 'LIKE', '488077%')
        .run(db)
        .then(data => data.rows)
        .then(rows => res.status(200).json(rows))
        .catch(err => res.status(500).json({message: err.message}))

}

export default router({
    GET: listConsignmentAuctionOrders
})