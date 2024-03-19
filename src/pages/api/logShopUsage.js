import router from "../../modules/serverUtils/requestRouter";
import {parseBody} from "../../modules/serverUtils/parseBody";
import fs from "fs";

function getHandler (req, res) {
    const usageData = fs.readFileSync("./src/json/usageTracker.json");
    const usage = JSON.parse(usageData);
    const mroUsage = usage?.['mro'];
    const ordersSentToInsightly = mroUsage?.['ordersSentToInsightly'] || 0;

    res.status(200).json([ordersSentToInsightly]);

}

function postHandler (req, res) {
    const body = parseBody(req);
    const count = body.count;

    const usageData = fs.readFileSync("./src/json/usageTracker.json");
    const usage = JSON.parse(usageData);

    const key = "ordersSentToInsightly";
    const mroUsage = usage?.['mro'];
    if(!mroUsage){
        usage['mro'] = {};
    }
    if(!mroUsage[key]){
        usage['mro'][key] = 0;
    }
    usage['mro'][key] += count;

    fs.writeFileSync("./src/json/usageTracker.json", JSON.stringify(usage,null,2));

    res.status(200).json({message:"success"});
}


export default router({
    GET: getHandler,
    POST: postHandler
})