import router from "../../../modules/serverUtils/requestRouter";
import { parseBody } from "../../../modules/serverUtils/parseBody";
import db from "../../../db/index"

export default router({
    POST: async (req, res) => {
        let body = parseBody(req);
        let skus = body.skus;
        if( !skus ) {
            res.status(400).json({ message: "No skus provided" });
            return
        }
        let getSkuDataQuery = `
            SELECT *
            FROM nfs.sursuite.components
            WHERE sku IN (${skus.map(sku => `'${sku}'`).join(",")})
        `
        let skuData = await db.query(getSkuDataQuery).then(res => res.rows);
        res.status(200).json(skuData);

    }
})