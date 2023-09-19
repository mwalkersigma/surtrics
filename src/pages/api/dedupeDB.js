import db from "../../db";
import Logger from "sigma-logger";


export default function handler (req,res) {
    Logger.log(`The database is being deduped`);
    return db.query(`
        DELETE FROM
            surtrics.surplus_metrics_data a
                USING surtrics.surplus_metrics_data b
        WHERE
            a.id < b.id
            AND a."user" = b."user"
            AND a.sku = b.sku
            AND a.code = b.code
            AND a.transaction_date = b.transaction_date
            AND a.transaction_type = b.transaction_type
            AND a.quantity = b.quantity;
    `)
        .then(() => {
            console.log("Success")
            res.status(200).json("Success")
        })

}