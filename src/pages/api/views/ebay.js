import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db";

import parseRequestToQuery from "../../../modules/serverUtils/parseRequestToQuery";






async function getBigCommerce(req,res) {
    let query = `SELECT * FROM surtrics.surplus_ebay_data`;
    let {rows} = await db.query(query);
    return res.status(200).json(rows)
}
async function getBigCommerceWithParams(req,res) {
    let paramsForQuery = parseRequestToQuery(`
                SELECT
                    sum(impressions::DECIMAL) as Impressions,
                    sum(page_views::DECIMAL) as PageViews
                FROM
                surtrics.surplus_ebay_data
    `,'date_for_week')(req);

    let {rows} = await db.query(...paramsForQuery);
    return res.status(200).json(rows)
}


export default router({
    GET: getBigCommerce,
    POST: getBigCommerceWithParams
})

