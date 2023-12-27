import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index";

async function getHandler(){
    return await db.query(`
        WITH
    big_commerce_sales AS (
        SELECT
            count(*) as transactions,
            DATE_TRUNC('month',payment_date) as payment_month,
            JSON_AGG(items) as items
        FROM
            surtrics.surplus_sales_data
        WHERE
            store_id = 225004
        GROUP BY
            payment_month,
            store_id
    ),
    ebay_sales AS (
        SELECT
            count(*) as transactions,
            DATE_TRUNC('month',payment_date) as payment_month,
            JSON_AGG(items) as items
        FROM
            surtrics.surplus_sales_data
        WHERE
                store_id = 255895
        GROUP BY
            payment_month,
            store_id
    ),
    increments AS (
        SELECT
            COUNT(*) AS total_increments,
            DATE_TRUNC('month', transaction_date) as month_of_transaction
        FROM
            surtrics.surplus_metrics_data
        WHERE
                transaction_type = 'Add'
            AND
            (
                transaction_reason = 'Add'
                OR transaction_reason = 'Add on Receiving'
                OR transaction_reason = 'Relisting'
            )
        GROUP BY
            month_of_transaction
    ),
    relisting AS (
        SELECT
            COUNT(*) as transactions,
            date_trunc('month',transaction_date) as date_of_transaction
        FROM
            surtrics.surplus_metrics_data
        WHERE
                transaction_type = 'Add'
          AND transaction_reason = 'Relisting'

        GROUP BY
            date_of_transaction

    ),
    new_listing AS (
        SELECT
            COUNT(*) as transactions,
            date_trunc('month',transaction_date) as date_of_transaction
        FROM
            surtrics.surplus_metrics_data
        WHERE
                transaction_type = 'Add'
          AND
            (
                        transaction_reason = 'Add'
                    OR transaction_reason = 'Add on Receiving'
                )
        GROUP BY
            date_of_transaction
    ),
    big_commerce AS (
        SELECT
            SUM(visits) as visits,
            SUM(shopped) as shopped,
            SUM(web_leads) as web_leads,
            SUM(add_to_cart) as add_to_cart,
            DATE_TRUNC('month',date_for_week) as month_bc
        FROM
            surtrics.surplus_big_commerce_data
        GROUP BY
            month_bc
    ),
    ebay AS (
        SELECT
            SUM(impressions) as impressions,
            SUM(page_views) as page_views,
            DATE_TRUNC('month',date_for_week) as month_ebay
        FROM
            surtrics.surplus_ebay_data
        GROUP BY
            month_ebay
    ),
    quickbooks AS (
        SELECT
            DATE_TRUNC('month',po_date) as month_quickbooks,
            count(*) as po_count,
            AVG(purchase_total) as po_avg,
            SUM(purchase_total) as po_total
        FROM
            surtrics.surplus_quickbooks_data
        GROUP BY
            month_quickbooks
    )
SELECT
    TO_CHAR(month_of_transaction,'YYYY-MM-DD') as month,
    impressions,
    page_views,
    ebay_sales.items as ebay_sales,
    ebay_sales.transactions as ebay_sales_transactions,
    big_commerce_sales.items as big_commerce_sales,
    big_commerce_sales.transactions as big_commerce_transactions,
    visits,
    new_listing.transactions as new_listing_transactions,
    relisting.transactions as relisting_transactions,
    total_increments,
    shopped,
    add_to_cart,
    web_leads,
    po_avg,
    po_count,
    po_total
FROM
    increments
LEFT JOIN
    big_commerce_sales ON DATE_TRUNC('month',big_commerce_sales.payment_month) = increments.month_of_transaction
LEFT JOIN
    ebay_sales ON DATE_TRUNC('month',ebay_sales.payment_month) = increments.month_of_transaction
LEFT JOIN
    relisting ON relisting.date_of_transaction = increments.month_of_transaction
LEFT JOIN
    new_listing ON new_listing.date_of_transaction = increments.month_of_transaction
LEFT JOIN
    big_commerce ON big_commerce.month_bc = increments.month_of_transaction
LEFT JOIN
    ebay ON ebay.month_ebay = increments.month_of_transaction
LEFT JOIN
    quickbooks ON quickbooks.month_quickbooks = increments.month_of_transaction
ORDER BY
    month_of_transaction
    `)
}

export const config = {
    api: {
        responseLimit: false,
    },
}

export default function handler(req, res) {
    return serverAdminWrapper((req, res) => {
        return router({
            GET: getHandler,
        })(req, res)
    })(req, res)
        .then((response) => {
            let data = {response};
            if(response?.rows){
                data.rows = response.rows;
            }
            res.status(200).json(data)
        })
        .catch((error) => {
            res.status(500).json({error})
        })
}