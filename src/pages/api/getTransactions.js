import Db from "../../db";
import { PromisePool} from "@supercharge/promise-pool";
import fs from "fs/promises";
import convertToDatabase from "../../modules/utils/convertSkuVaultToDatabaseFormat";
import logger from "sigma-logger"
const {log} = logger;
const {SKU_VAULT_TENANT_TOKEN, SKU_VAULT_USER_TOKEN} = process.env;
// exported 8/24/2023 1:11pm;

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds*1000));


const convertFrequencyToSeconds = (frequency) => {
    switch (frequency) {
        case "every minute":
            return 60;
        case "every 5 minutes":
            return 300;
        case "every 15 minutes":
            return 900;
        case "every half hour":
            return 1800;
        case "every hour":
            return 3600;
        case "daily":
            return 86400;
        case "weekly":
            return 604800;
    }
}

async function processTransaction(pageNumber,currentTimestamp,timeLastUpdated){


    try {
        log("getting transactions between: ", timeLastUpdated, " and ", currentTimestamp)
    } catch (e) {
        console.log("error: ", e)
    }
    const body = {
        "ToDate": currentTimestamp,
        "FromDate": timeLastUpdated,
        "PageNumber": pageNumber,
        "PageSize": 100,
        "TenantToken": SKU_VAULT_TENANT_TOKEN,
        "UserToken" : SKU_VAULT_USER_TOKEN,
    }
    const method = "POST";
    let response = await fetch("https://app.skuvault.com/api/inventory/getTransactions", {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
    log("response: ", response.headers)
    let data = await response.json();
    if(response.status === 429){
        return response.headers;
    }
    if(data['Transactions'].length === 0){
        log("response status: ", response.status)
        log("response statusText: ", response.statusText)
        return false;
    }
    await PromisePool
        .withConcurrency(25)
        .for(data['Transactions'])
        .process(async (item) => {
            log("Inserting Record for sku: " , item['Sku'])
            await Db.query(`
                INSERT INTO nfs.surtrics.surplus_metrics_data (
                    "user", sku, code, scanned_code, lot_number, title, quantity,
                    quantity_before, quantity_after, location, serial_numbers,
                    transaction_type, transaction_reason, transaction_note,
                    transaction_date, context
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                convertToDatabase(item))
            log("INSERTED Record for sku: " , item['Sku'])
        })

    return true;
}
async function getTransactions(){
    let pageNumber = 0;
    let result = true;
    const currentTimestamp = new Date().toISOString();
    const {timeLastUpdated} = await fs
        .readFile("./src/json/timeLastUpdated.json", "utf-8")
        .then((data) => JSON.parse(data));

    let {frequency} = await fs
        .readFile("./src/json/settings.json", "utf-8")
        .then((data) => JSON.parse(data));
    log("frequency: ", frequency)
    frequency = convertFrequencyToSeconds(frequency);
    let timeDiff = (new Date(currentTimestamp) - new Date(timeLastUpdated))/1000;
    log("timeDiff: ", timeDiff)
    if(timeDiff < frequency){
        return "Not enough time has passed since last update"
    }
    log("finished writing timeLastUpdated.json")
    while(result){
        result = await processTransaction(pageNumber,currentTimestamp,timeLastUpdated);
        if(result?.['X-RateLimit-Reset']){
            await sleep(result['X-RateLimit-Reset'])
        }
        pageNumber++;
    }
    await fs.writeFile("./src/json/timeLastUpdated.json", JSON.stringify({timeLastUpdated: currentTimestamp}))
    log(`Finished inserting into DB ${pageNumber-1} pages of transactions`)
    return "update complete";
}

export default function handler (req,res){
    return getTransactions()
    .then((message) => {
        res.status(200).json({message});
    })
    .catch((error) => {
        res.status(400).json(error);
    });
}