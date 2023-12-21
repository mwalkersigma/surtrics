import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import parseRequestToQuery from "../../../modules/serverUtils/parseRequestToQuery";

async function getBigCommerce(req,res) {
    let query = `SELECT * FROM surtrics.surplus_big_commerce_data`;
    let {rows} = await db.query(query);
    return res.status(200).json(rows)
}
async function getBigCommerceWithParams(req,res) {
    let paramsForQuery = parseRequestToQuery(`
                SELECT
                    sum(visits::DECIMAL) as visits,
                    sum(shopped::DECIMAL) as shopped,
                    sum(web_leads::DECIMAL) as web_leads,
                    sum(add_to_cart::DECIMAL) as add_to_cart
                FROM
                surtrics.surplus_big_commerce_data
    `,'date_for_week')(req);

    let {rows} = await db.query(...paramsForQuery);
    return res.status(200).json(rows)
}


export default router({
    GET: getBigCommerce,
    POST: getBigCommerceWithParams
})
