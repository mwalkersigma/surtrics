import router from "../../../modules/serverUtils/requestRouter";
import Query from "../../../modules/classes/query";
import db from "../../../db/index"

async function getHandler(req,res){
    let query = new Query(
        "surtrics.ebay_defect_rate",
        ["id","defect_rate","date_entered","user_who_entered"]
    )
    let rows = await query.run(db,console.log).then((result) => result.rows)
    return res.status(200).json(rows)

}


export default router({
    GET: getHandler,
    POST: getHandler,
})
