import fs from "fs"
import fsp from "fs/promises";

import Downloader from "nodejs-file-downloader";
import decompress from "decompress";
import {parse} from "csv-parse";

import APILimiter from "../../modules/limiter/limiter";
import ServerRequest from "../../modules/requester/serverRequest";
import db from "../../db/index"
import Logger from "sigma-logger";

const {APPLICATION_ID, SHARED_SECRET, REFRESH_TOKEN} = process.env

const limiter =  APILimiter(10000000,1440,5);
const channelAdvisorLimiter = APILimiter(2000,1,5);
function convertInvalidDate(date){
    return new Date(date
        .replace(/-/g, '/')
        .replace(/T/, ' ')
        .replace(/Z/, ' ')
        .replace(/\.\d+/, '')
    );

}

const removeSingleQuotes = (str) => str.replace(/'/g, "");
async function authorizeChannelAdvisor () {
    const authURL = 'https://api.channeladvisor.com/oauth2/token'
    const authHeader = {
        "Authorization": `Basic ${btoa(`${APPLICATION_ID}:${SHARED_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', REFRESH_TOKEN);

    const requester = new ServerRequest(limiter);
    requester.headers = authHeader;
    requester.body = body;
    requester.method = 'POST';

    const accessTokenResponse = await requester.executeRequest(authURL);
    const accessTokenData = await accessTokenResponse.json();
    return accessTokenData['access_token'];
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function getUpdatesFromChannelAdvisor () {

    let channelAdvisorTokens = await fsp.readFile("./src/json/access_token.json").then(JSON.parse);
    let {time,access_token,export_token} = {...channelAdvisorTokens};
    const now = new Date();

    if(!access_token){
        // If we don't have a token, we need to get one.
        const newAccessToken = await authorizeChannelAdvisor();
        time = now;
        access_token = newAccessToken;
        export_token = "";
    }
    Logger.log(JSON.stringify([time,access_token,export_token]))
    const timeSinceLastAuth = now - new Date(time);
    const oneHour = 1000 * 60 * 60;

    if(timeSinceLastAuth > oneHour){
        // If the token is more than an hour old, we need to get a new one.
        const newAccessToken = await authorizeChannelAdvisor();
        time = now;
        access_token = newAccessToken;
        export_token = "";
    }

    let baseURL = 'https://api.channeladvisor.com/v1/ProductExport/attr:(RetailPrice)';
    let searchParams = `?access_token=${access_token}`;
    const requester = new ServerRequest(channelAdvisorLimiter);

    requester.headers = {
        "Authorization": `Bearer ${access_token}`,
    }

    if(export_token){
        Logger.log("Export token found. Using token to get data.")
        requester.method = 'GET';
        searchParams += `&token=${export_token}`;
    }else{
        requester.method = 'POST';
    }

    const response = await requester.executeRequest(baseURL + searchParams);
    const data = await response.json();
    const token = data['Token'];
    Logger.log(token)
    if(!export_token){
        Logger.log("No export token found. Saving token to file.")
        export_token = token;
        fs.writeFileSync("./src/json/access_token.json",JSON.stringify({time,access_token,export_token}));
    }
    Logger.log(data);
    return data;
}

async function getFileResponseUrl(){
    let fileResponseUrl = null;
    do {
        let response = await getUpdatesFromChannelAdvisor();
        fileResponseUrl = response['ResponseFileUrl'];
        if(!fileResponseUrl) {
            await sleep(1000 * 60)
        }
    }while (!fileResponseUrl);
    Logger.log("File response url found.")
    return fileResponseUrl;
}
async function downloadFile(fileResponseUrl){
    const {access_token} = await fsp.readFile("./src/json/access_token.json").then(JSON.parse);
    Logger.log("starting download.")
    const downloader = new Downloader({
        url: fileResponseUrl,
        directory: "./src/json/outputs",
        headers:{
            "Authorization": `Bearer ${access_token}`
        }
    });
    try {
        await downloader.download();
    }
    catch (e) {
        Logger.log("Error downloading file.");
        Logger.log(e)
    }
    Logger.log("Finished downloading file.")
}
export async function ChannelRouteMain(){
    Logger.log("Starting Channel Advisor Route.")
    let fileResponseUrl = await getFileResponseUrl();
    await downloadFile(fileResponseUrl);
    let outputFolder = "./src/json/outputs";
    let outputFiles = await fsp.readdir(outputFolder);
    let file = outputFiles[0];
    Logger.log("unzipping files.")
    await decompress(`${outputFolder}/${file}`, outputFolder)
    Logger.log("Finished unzipping files.")
    Logger.log("Parsing TSV.")
    let records = [];
    await new Promise((res,rej)=>{
        const parser = parse({
            delimiter: '\t',
        });
        fs.createReadStream(`${outputFolder}/${file.split(".")[0]}.txt`).pipe(parser);
        parser.on('readable', function(){
            let record;
            while ((record = parser.read()) !== null) {
                const isParent = record[6] === "Parent";
                const isApproved = record[91] === "Approved";
                const hasFinalApprovalDate = record[89] !== "";
                if(isParent && isApproved && hasFinalApprovalDate){
                    const sku = record[5];
                    const mpn = record[35];
                    const manufacturer = removeSingleQuotes(record[46]);
                    const approver = record[101];
                    const finalApprovalDate = record[89];
                    records.push({sku,approver,mpn,manufacturer,finalApprovalDate})
                }

            }
        });
        parser.on('error', function(err){
            console.error(err.message)
            rej(err)
        })
        parser.on('end', function(){
            Logger.log('done parsing TSV')
            Logger.log(records.length)
            res()
        })
    })
    Logger.log("Finished parsing TSV.")
    Logger.log("Cleaning Table.")
    await db.query(`DROP TABLE IF EXISTS nfs.surtrics.surplus_approvals;`);
    Logger.log("Table Dropped. Recreating Table.")
    await db.query(`
                CREATE TABLE IF NOT EXISTS nfs.surtrics.surplus_approvals
                    (
                        id BIGSERIAL PRIMARY KEY,
                        sku VARCHAR(255) NOT NULL,
                        part_number VARCHAR(255),
                        manufacturer VARCHAR(255),
                        date_of_final_approval timestamp,
                        template_approval_status VARCHAR(255),
                        user_who_approved VARCHAR(255)
                    )
                `);
    Logger.log("Table Recreated. Inserting data.");
    let query = `
                    INSERT INTO nfs.surtrics.surplus_approvals
                        (sku, part_number, manufacturer, date_of_final_approval, template_approval_status, user_who_approved)
                    VALUES
                `;

    records.forEach((approval,i) => {
        if(new Date(approval.finalApprovalDate).toString() === "Invalid Date") {
            approval.finalApprovalDate = convertInvalidDate(approval.finalApprovalDate)
        }
        const formatDate = new Date(approval.finalApprovalDate).toLocaleString('en-US', {timeZone: 'America/Chicago', hour12: true});
        query += `('${approval.sku}','${approval.mpn}','${approval.manufacturer}', '${formatDate}', 'Approved', '${approval.approver}')`;
        if(i < records.length - 1){
            query += ','
        }

    })
    query += ';'
     fs.writeFileSync("./src/data/channelAdvisor.json",JSON.stringify(records,null,2),{flag: "w+"});
    console.log(query)
    await db.query(query)
    Logger.log("Data inserted. Cleaning up.");
    Logger.log("Cleaning up outputs folder.");

    fs.readdir(outputFolder, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(`${outputFolder}/${file}`, err => {
                if (err) throw err;
            });
        }
    })
    fs.writeFileSync("./src/json/access_token.json",JSON.stringify({}));
    Logger.log("Finished Channel Advisor Route.")
    return "Finished Channel Advisor Route."
}



export default function handler (req,res) {
    return ChannelRouteMain()
        .then((data) => res.status(200).json({statusCode: 200, message : data}))
        .catch(err => res.status(500).json({statusCode: 500, message : err.message}))
}