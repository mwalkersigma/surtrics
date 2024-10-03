import router from "../../../../modules/serverUtils/requestRouter";
import serverAdminWrapper from "../../../../modules/auth/serverAdminWrapper";
import db from "../../../../db/index"

export default router({
    PUT: serverAdminWrapper(async (req, res, session) => {
        try {
            const {oppID} = req.query;
            if (!oppID) {
                return res.status(400).json({message: "Missing Opp ID"})
            }
            const dbResponse = await db.query(`
                UPDATE nfs.logs.processed_opp_ids
                SET outcome = 'reviewed'
                WHERE opp_id = $1
            `, [oppID[0]])
            console.log(dbResponse)
            console.log("Marked as reviewed", oppID[0])
            return res.status(200).json({message: "Success", dbResponse})
        } catch (e) {
            console.error(e)
            return res.status(500).json({message: "Internal Server Error: " + e.message})
        }
    }, "bsa", "surplus director", "buying group")
})