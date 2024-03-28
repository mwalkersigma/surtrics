import router from "../../../../modules/serverUtils/requestRouter";
import Query from "../../../../modules/classes/query";
import db from "../../../../db/index"

async function getHandler(req, res){
    let myQuery = new Query(
        "sursuite.components",
        ["sku", "quantity","retail_price","cost"],
    )
        .addWhere("quantity",">",0)
        .addWhere("sku","LIKE","%-%")



    let rows = await myQuery.run(db,console.log).then(({rows})=> rows )
    return res.status(200).json(rows)
}


export default router({
    GET: getHandler
})