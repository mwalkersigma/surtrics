import fs from "fs"
import fsp from "fs/promises";

import Downloader from "nodejs-file-downloader";
import decompress from "decompress";

import APILimiter from "../../modules/limiter/limiter";
import ServerRequest from "../../modules/requester/serverRequest";
import db from "../../db/index"

const {APPLICATION_ID, SHARED_SECRET, REFRESH_TOKEN} = process.env

const limiter =  APILimiter(10000000,1440,5);
const channelAdvisorLimiter = APILimiter(2000,1,5);
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
    console.log("here")
    let {time,access_token,export_token} = {...channelAdvisorTokens};
    const now = new Date();

    if(!access_token){
        // If we don't have a token, we need to get one.
        const newAccessToken = await authorizeChannelAdvisor();
        time = now;
        access_token = newAccessToken;
        export_token = "";
    }
    console.log(time,access_token,export_token)
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
        console.log("Export token found. Using token to get data.")
        requester.method = 'GET';
        searchParams += `&token=${export_token}`;
    }else{
        requester.method = 'POST';
    }

    const response = await requester.executeRequest(baseURL + searchParams);
    const data = await response.json();
    const token = data['Token'];
    console.log(token)
    if(!export_token){
        console.log("No export token found. Saving token to file.")
        export_token = token;
        fs.writeFileSync("./src/json/access_token.json",JSON.stringify({time,access_token,export_token}));
    }
    console.log(data);
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
    console.log("File response url found.")
    return fileResponseUrl;
}
async function downloadFile(fileResponseUrl){
    const {access_token} = await fsp.readFile("./src/json/access_token.json").then(JSON.parse);
    console.log("starting download.")
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
        console.log("Error downloading file.");
        console.log(e)
    }
    console.log("Finished downloading file.")
}
export async function ChannelRouteMain(){
    console.log("Starting Channel Advisor Route.")
    let fileResponseUrl = await getFileResponseUrl();
    console.log("File response url found.")
    await downloadFile(fileResponseUrl);
    let outputFolder = "./src/json/outputs";
    let outputFiles = await fsp.readdir(outputFolder);
    let file = outputFiles[0];
    console.log("unzipping files.")
    await decompress(`${outputFolder}/${file}`, outputFolder)
    let fileContents = fs.createReadStream(`${outputFolder}/${file.split(".")[0]}.txt`);
    let count = 0;
    let results = [];
    let headers ;
    fileContents.on('data', (chunk) => {
        let data = chunk
            .toString()
            .split("\n")
            .map(line => line.split("\t"));

        if(count === 0) {
            headers = data.splice(0, 1)[0];
            count++;
        }
        data.forEach(line => {
            const isParent = line[6] === "Parent";
            const isApproved = line[91] === "Approved";
            const hasFinalApprovalDate = line[89] !== "";
            if(!isParent || !isApproved || !hasFinalApprovalDate){
                return
            }
            const sku = line[5];
            const approver = line[101];
            const finalApprovalDate = line[89];
            results.push({
                sku,
                approver,
                finalApprovalDate
            })
        })
    });
    fileContents.on('close', () => {
        console.log('No more data in response.');
        db.query(`DROP TABLE IF EXISTS nfs.surtrics.surplus_approvals;`)
            .then(()=>db.query(`
                CREATE TABLE IF NOT EXISTS nfs.surtrics.surplus_approvals
                    (
                        id BIGSERIAL PRIMARY KEY,
                        sku VARCHAR(255) NOT NULL,
                        date_of_final_approval timestamp,
                        template_approval_status VARCHAR(255),
                        user_who_approved VARCHAR(255)
                    )
                `))
            .then(()=>{
                let query = `
                    INSERT INTO nfs.surtrics.surplus_approvals
                        (sku, date_of_final_approval, template_approval_status, user_who_approved)
                    VALUES
                `;
                results.forEach((approval,i) => {
                    query += `('${approval.sku}', '${approval.finalApprovalDate}', 'Approved', '${approval.approver}')`
                    if(i < results.length - 1){
                        query += ','
                    }
                })
                query += ';'
                return db.query(query)
            })
    });
    return "Finished Channel Advisor Route."
}



export default function handler (req,res) {
    return ChannelRouteMain()
        .then((data) => res.status(200).json({statusCode: 200, message : data}))
        .catch(err => res.status(500).json({statusCode: 500, message : err.message}))

}