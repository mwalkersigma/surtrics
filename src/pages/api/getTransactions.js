import Db from "../../db";
import { PromisePool} from "@supercharge/promise-pool";
import convertToDatabase from "../../modules/utils/convertSkuVaultToDatabaseFormat";
import Logger from "sigma-logger";
import {isTimeToUpdate} from "../../modules/serverUtils/isTimeToUpdate";
import getLastUpdatedTime from "../../modules/serverUtils/getLastUpdatedTime";
import updateLastUpdatedTime from "../../modules/serverUtils/updateLastUpdatedTime";
const {SKU_VAULT_TENANT_TOKEN, SKU_VAULT_USER_TOKEN} = process.env;
// exported 8/24/2023 1:11pm;

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds*1000));

async function processTransaction(pageNumber,currentTimestamp,timeLastUpdated){

    const body = {
        "ToDate": currentTimestamp,
        "FromDate": timeLastUpdated,
        "PageNumber": pageNumber,
        "PageSize": 100,
        "TenantToken": SKU_VAULT_TENANT_TOKEN,
        "UserToken" : SKU_VAULT_USER_TOKEN,
    }
    try {
        Logger.log(`body: ${JSON.stringify({currentTimestamp,timeLastUpdated,pageNumber},null,2)}`);
    }catch (e) {
        Logger.log(`error: ${e}`)
        Logger.log(`body: ${body} `)
    }

    const method = "POST";
    let response = await fetch("https://app.skuvault.com/api/inventory/getTransactions", {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
    Logger.log(`response status: ${response.status}`);
    Logger.log(`response statusText: ${response.statusText}`);
    Logger.log(`response x-ratelimit-limit': ${response.headers.get('x-ratelimit-limit')}`);
    Logger.log(`response x-ratelimit-remaining': ${response.headers.get('x-ratelimit-remaining')}`);
    Logger.log(`response x-ratelimit-reset': ${response.headers.get('x-ratelimit-reset')}`);

    let data = await response.json();
    if(response.status === 429){
        return response.headers;
    }
    if(data['Transactions'].length === 0){
        Logger.log(`response status: ${response.status}`)
        Logger.log(`response statusText: ${response.statusText} `)
        return false;
    }

    let transactions = new Set();
    data['Transactions'].forEach((item) => {
        let originalLength = transactions.size;
        delete item['Activity ID'];
        transactions.add(JSON.stringify(item))
        if(originalLength === transactions.size){
            Logger.log(`duplicate found: ${JSON.stringify(item)}`)
        }
    })
    transactions = [...transactions].map((item) => JSON.parse(item));
    await PromisePool
        .withConcurrency(25)
        .for(transactions)
        .process(async (item) => {
            Logger.log(`Inserting Record for sku: ${item['Sku']}`)
            await Db.query(`
                INSERT INTO nfs.surtrics.surplus_metrics_data (
                    "user", sku, code, scanned_code, lot_number, title, quantity,
                    quantity_before, quantity_after, location, serial_numbers,
                    transaction_type, transaction_reason, transaction_note,
                    transaction_date, context
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                convertToDatabase(item))
            Logger.log(`Inserted Record for sku: ${item['Sku']}`)
        })

    return true;
}



async function getTransactions(){
    try {
        let pageNumber = 0;
        let result = true;
        const currentTimestamp = new Date().toISOString();
        const timeLastUpdated = await getLastUpdatedTime("skuVault");
        const shouldNotUpdate = await isTimeToUpdate(currentTimestamp, timeLastUpdated);

        if(shouldNotUpdate){
            Logger.log("not time to update")
            return "not time to update";
        }


        while (result) {
            result = await processTransaction(pageNumber, currentTimestamp, timeLastUpdated);
            if (result?.['X-RateLimit-Reset']) {
                await sleep(result['X-RateLimit-Reset'])
            }
            pageNumber++;
        }
        await updateLastUpdatedTime("skuVault")

        let lastID = await getLastUpdatedTime("dedupe");

        let removedDuplicates = await Db.query(`
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
        AND a.quantity = b.quantity
        AND a.location = b.location
        AND a.transaction_type != 'Error'
        AND a.id > $1
            RETURNING a.*`,[lastID]);

        console.log(`removed duplicates: ${removedDuplicates.rowCount}`)

        let lastId = await Db.query(`SELECT id FROM surtrics.surplus_metrics_data ORDER BY id DESC LIMIT 1;`)
        lastId = lastId.rows[0].id;
        
        await updateLastUpdatedTime("dedupe",lastId)
        Logger.log(`Finished inserting into DB ${pageNumber - 1} pages of transactions`)
        return "update complete";
    } catch (e) {
        Logger.log(`error: ${e}`)
        return e;
    }
}

export default function handler (req,res){
    Logger.log(`request received to update transactions`)
    return getTransactions()
    .then((message) => {
        res.status(200).json({message});
    })
    .catch((error) => {
        res.status(400).json(error);
    });
}