import router from "../../../modules/serverUtils/requestRouter";
import Query from "../../../modules/classes/query";
import db from "../../../db/index"
import {parseBody} from "../../../modules/serverUtils/parseBody";

async function postHandler(req,res) {
    const { startDate, endDate } = parseBody(req);

    const query = new Query(
        "sursuite.components",
        [
            "count(*) as count",
            "image_last_updated_utc",
            "image_last_updated_by"
        ]
    )
        .addWhere("image_last_updated_utc", ">", startDate)
        .addWhere("image_last_updated_utc", "<", endDate)
        .addGroupBy("image_last_updated_by")
        .addGroupBy("image_last_updated_utc")

    let rows = await query.run(db).then(({rows})=>rows)
    return res.status(200).json(rows)
}


export default router({
    POST: postHandler
})