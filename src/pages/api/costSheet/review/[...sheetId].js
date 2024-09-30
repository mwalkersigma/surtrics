import router from "../../../../modules/serverUtils/requestRouter";
import serverAdminWrapper from "../../../../modules/auth/serverAdminWrapper";
import db from "../../../../db/index"

export default router({
    PUT: serverAdminWrapper(async (req, res, session) => {
        try {
            const {sheetId} = req.query;
            const userName = session.user.name;
            if (!sheetId) {
                return res.status(400).json({message: "Missing sheetId"})
            }

            const dbResponse = await db.query(`
                UPDATE nfs.surtrics.surplus_po_sheets
                SET update_date  = TIMESTAMP 'now',
                    is_reviewed  = true,
                    who_reviewed = $2
                WHERE sheet_id = $1
            `, [sheetId[0], userName])

            return res.status(200).json({message: "Success"})
        } catch (e) {
            console.error(e)
            return res.status(500).json({message: "Internal Server Error: " + e.message})
        }
    }, "bsa", "surplus director", "buying group")
})