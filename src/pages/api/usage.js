import router from "../../modules/serverUtils/requestRouter";
import logUsage from "../../modules/usageTracking/usageTracker";
import {parseBody} from "../../modules/serverUtils/parseBody";
import fs from "fs/promises";




async function postHandler(req,res){
    let {key,parentKey,user} = parseBody(req);
    logUsage(parentKey,key,user);
    return res.status(200).send('ok')
}

async function getHandler(req,res){
    let file = await fs.readFile("./src/json/usageTracker.json");
    file = JSON.parse(file);
    return res.status(200).json(file)
}



export default router({
    GET:getHandler,
    POST:postHandler,
})