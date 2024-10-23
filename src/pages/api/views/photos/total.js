import router from "../../../../modules/serverUtils/requestRouter";
import Query from "../../../../modules/classes/query";
import db from "../../../../db"

async function postHandler(req, res) {
    const query = new Query(
        "sursuite.components",
        [
            "count(*) as count",
        ]
    )
        .addWhere("sku", "NOT LIKE", '%-%')
        .isNotNull("image_last_updated_utc")
    let rows = await query.run(db, console.log).then(({rows}) => rows)
    return res.status(200).json(rows)
}


export default router({
    GET: postHandler
})