import router from "../../modules/serverUtils/requestRouter";
import logUsage from "../../modules/usageTracking/usageTracker";
import {parseBody} from "../../modules/serverUtils/parseBody";
import * as path from "path";
import fs from "fs";




function postHandler(req,res){
    let {key,parentKey} = parseBody(req);
    console.log(`Updated usageTracker.json @ ${new Date()} file location: ${path.join(__dirname, 'usageTracker.json')}`);
    logUsage(parentKey,key);
    res.status(200).send('ok');
}

function getHandler(req,res){
    fs.readFile(path.join(__dirname, 'usageTracker.json'), 'utf8', function (err, data) {
        if (err) throw err;

        res.status(200).send(data);
    })
}



export default router({
    GET:getHandler,
    POST:postHandler,
})