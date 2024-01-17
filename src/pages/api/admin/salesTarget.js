import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import router from "../../../modules/serverUtils/requestRouter";
import fs from "fs/promises";
import {parseBody} from "../../../modules/serverUtils/parseBody";


function makeSalesTargets( incomingSalesTargets ){
    let defaultSettings = {
        "daily": 26455,
        "weekly": 185185,
        "monthly": 833333,
        "yearly": 10000000
    }
    let yearly = incomingSalesTargets?.['yearly'];
    let monthly = incomingSalesTargets?.['monthly'];
    let weekly = incomingSalesTargets?.['weekly'];
    let daily = incomingSalesTargets?.['daily'];

    if( yearly && !monthly && !weekly && !daily ){
        monthly = yearly / 12;
        weekly = yearly / 52;
        daily = yearly / 365;
    }
    if( monthly && !yearly && !weekly && !daily ){
        yearly = monthly * 12;
        weekly = yearly / 52;
        daily = yearly / 365;
    }
    if( weekly && !yearly && !monthly && !daily ){
        yearly = weekly * 52;
        monthly = yearly / 12;
        daily = yearly / 365;
    }
    if( daily && !yearly && !monthly && !weekly ){
        yearly = daily * 365;
        monthly = yearly / 12;
        weekly = yearly / 52;
    }
    if(!yearly && !monthly && !weekly && !daily ){
        yearly = defaultSettings?.['yearly'];
        monthly = defaultSettings?.['monthly'];
        weekly = defaultSettings?.['weekly'];
        daily = defaultSettings?.['daily'];
    }
    return {
        yearly,
        monthly,
        weekly,
        daily
    }
}


async function getHandler(req,res){
    const settings = await fs.readFile("./src/json/settings.json");
    return res.status(200).json(JSON.parse(settings)?.['salesTarget'])
}
function postHandler(req,res){
    return serverAdminWrapper(async (req) => {
        const body = parseBody(req.body);

        const settings = await fs.readFile("./src/json/settings.json").then((settings) => JSON.parse(settings));

        let salesTargets = makeSalesTargets(body?.['salesTargets']);

        settings['salesTarget'] = salesTargets;

        await fs.writeFile("./src/json/settings.json",JSON.stringify(settings,null,2));

    },"admin",'surplus director')(req,res)
        .then(() => {
            return res.status(200).json("Goal Updated")
        })
        .catch((error) => {
            return res.status(500).json(error.message)
        })
}

export default router({
    GET: getHandler,
    POST: postHandler,
});
