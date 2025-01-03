import router from "../../../modules/serverUtils/requestRouter.js";
import db from "../../../db/index.js";
import Query from "../../../modules/classes/query.js";

async function listOrderIssues(req, res) {
    return new Query('nfs.sursuite.order_issues oi', ['*'])
        // .conditional(
        //     req?.query?.['withOrder'],
        //     (query) => query.join('nfs.sursuite.orders o', 'LEFT', 'o.order_id = oi.order_id'),
        //     () => {}
        // )
        // .conditional(
        //     req?.query?.['withItem'],
        //     (query) => query.join('nfs.sursuite.components c', 'LEFT', 'c.sku = oi.sku'),
        //     () => {}
        // )
        .run(db)
        .then(data => data.rows)
        .then(data => res.status(200).json(data))
        .catch(e => res.status(500).json({message: "Error", error: e.message}));
}

async function createOrderIssue(req, res) {
    try {
        const body = req.body;

        const createResponse = await db.query(`
            INSERT INTO nfs.sursuite.order_issues(order_id, status, date_created, location, sku, quantity, issue, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `, [
            body.orderNumber,
            body.orderStatus,
            body.date,
            body.location,
            body.sku,
            body.quantity,
            body.issue,
            body.notes

        ]).then(data => data.rows)

        console.log(`Created Order Issue: ${createResponse[0].id}`);

        res.status(201).json({message: "Order Issue Created", data: createResponse[0]});
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Error", error: e.message});
    }


}

async function updateOrderIssue(req, res) {
}

async function gridUpdateConnector(req, res) {
    const body = req.body;
    const {id, column, value} = body;
    const query = `
        UPDATE nfs.sursuite.order_issues
        SET ${column} = $1
        WHERE id = $2
        RETURNING *
    `
    return db.query(query, [value, id])
        .then(data => data.rows[0])
        .then(data => res.status(200).json({message: "Success", data}))
        .catch(e => {
            console.error(e);
            res.status(500).json({message: "Error", error: e.message})
        });
}

async function deleteOrderIssue(req, res) {
}


export default router({
    GET: listOrderIssues,
    POST: createOrderIssue,
    PUT: updateOrderIssue,
    PATCH: gridUpdateConnector,
})