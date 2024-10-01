import router from "../../../../../modules/serverUtils/requestRouter";
import Query from "../../../../../modules/classes/query";
import db from "../../../../../db/index";

export default router({
    GET: async (req, res) => {
        let query = new Query(
            "nfs.surplusapi.approved_templates",
            ["COUNT(*) as count"]
        )
        let rows = await query.run(db, console.log).then(({rows}) => rows)
        return res.status(200).json(rows[0])
    }
})