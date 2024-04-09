import router from "../../../modules/serverUtils/requestRouter";
import Query from "../../../modules/classes/query";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import db from "../../../db/index"

async function getHandler(req,res){
    console.log(parseBody(req))
    let query = new Query(
        "surtrics.ebay_defect_rate",
        ["id","defect_rate","date_entered","user_who_entered"]
    )
    console.log(query.getParsedQuery())
    let rows = await query.run(db,console.log).then((result) => result.rows)
    console.log(rows)
    return res.status(200).json(rows)

}


export default router({
    GET: getHandler,
    POST: getHandler,
})
