import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index"
import Query from "../../../modules/classes/query";

export default router({
    GET: async (req, res) => {
        try {
            const queryParams = req.query;
            const startDate = queryParams?.startDate;
            const endDate = queryParams?.endDate;
            const createdBy = queryParams?.createdBy;
            const reviewedBy = queryParams?.reviewedBy;

            const baseQuery = new Query('nfs.surtrics.surplus_po_sheets', ['*'])
                .conditional(startDate, (query) => query.addWhere('create_date', '>=', startDate), () => null)
                .conditional(endDate, (query) => query.addWhere('create_date', '<=', endDate), () => null)
                .conditional(
                    createdBy,
                    (query) => query.addWhere('po_created_by', '=', createdBy),
                    () => null
                )
                .conditional(reviewedBy, (query) => query.addWhere('who_reviewed', '=', reviewedBy), () => null)

            const rows = await baseQuery.run(db, console.log).then(res => res.rows);
            return res.status(200).json({message: "Success", rows})
        } catch (e) {
            console.error(e)
            return res.status(500).json({message: "Internal Server Error: " + e.message})
        }
    }
})