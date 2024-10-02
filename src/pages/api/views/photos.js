import router from "../../../modules/serverUtils/requestRouter";
import Query from "../../../modules/classes/query";
import db from "../../../db/index"
import {parseBody} from "../../../modules/serverUtils/parseBody";

async function postHandler(req, res) {
    const {startDate, endDate, total, parentOnly} = parseBody(req);

    const query = new Query(
        "sursuite.components",
        [
            "count(*) as count",
        ]
    )
        .conditional(startDate,
            (q) => q.addWhere("image_last_updated_utc", ">", startDate),
            () => null
        )
        .conditional(endDate,
            (q) => q.addWhere("image_last_updated_utc", "<", endDate),
            () => null
        )
        .conditional(parentOnly, (q) => q.addWhere("sku", "NOT LIKE", '%-%'), () => null)
        .conditional(total,
            (q) => q.isNotNull("image_last_updated_utc"),
            (q) => q
                .addGroupBy("image_last_updated_by")
                .addGroupBy("image_last_updated_utc")
                .addColumn('image_last_updated_by')
                .addColumn('image_last_updated_utc')
        )

    let rows = await query.run(db, console.log).then(({rows}) => rows)
    return res.status(200).json(rows)
}


export default router({
    POST: postHandler
})