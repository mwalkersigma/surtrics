import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import router from "../../../modules/serverUtils/requestRouter";
import fs from "fs/promises";
import {parseBody} from "../../../modules/serverUtils/parseBody";


function makeSalesTargets( incomingSalesTargets, currentSalesTargets ){
    let defaultSettings = {
        "daily": 26455,
        "weekly": 185185,
        "monthly": 833333,
        "yearly": 8000000
    }
    let result = {};
    let yearly = Math.round(incomingSalesTargets?.['yearly']);
    let monthly = incomingSalesTargets?.['monthly'];
    let weekly = incomingSalesTargets?.['weekly'];
    let daily = incomingSalesTargets?.['daily'];

    let difCount = 0;

    for(let key in defaultSettings){
        if(currentSalesTargets[key] !== incomingSalesTargets[key]){
            difCount++;
        }
    }
    console.log(difCount)
    if(difCount === 0){
        result =  defaultSettings;
    }

    if(difCount === 4){
        result = incomingSalesTargets;
    }

    if(difCount === 1 || difCount === 3){
        if(yearly){
            result = {
                "daily": yearly / 365,
                "weekly": yearly / 52,
                "monthly": yearly / 12,
                "yearly": yearly
            }
        }
        if(monthly){
            result = {
                "daily": monthly / 30,
                "weekly": monthly / 4,
                "monthly": monthly,
                "yearly": monthly * 12
            }
        }
        if(weekly){
            result = {
                "daily": weekly / 7,
                "weekly": weekly,
                "monthly": weekly * 4,
                "yearly": weekly * 52
            }
        }
        if(daily){
            result = {
                "daily": daily,
                "weekly": daily * 7,
                "monthly": daily * 30,
                "yearly": daily * 365
            }
        }

    }

    if(difCount === 2) {
        if (yearly && monthly) {
            result = {
                "daily": yearly / 365,
                "weekly": yearly / 52,
                "monthly": yearly / 12,
                "yearly": yearly
            }
        }
        if (yearly && weekly) {
            result = {
                "daily": yearly / 365,
                "weekly": yearly / 52,
                "monthly": yearly / 12,
                "yearly": yearly
            }
        }
        if (yearly && daily) {
            result = {
                "daily": yearly / 365,
                "weekly": yearly / 52,
                "monthly": yearly / 12,
                "yearly": yearly
            }
        }
        if (monthly && weekly) {
            result = {
                "daily": monthly / 30,
                "weekly": monthly / 4,
                "monthly": monthly,
                "yearly": monthly * 12
            }
        }
        if (monthly && daily) {
            result = {
                "daily": monthly / 30,
                "weekly": monthly / 4,
                "monthly": monthly,
                "yearly": monthly * 12
            }
        }
        if (weekly && daily) {
            result = {
                "daily": weekly / 7,
                "weekly": weekly,
                "monthly": weekly * 4,
                "yearly": weekly * 52
            }
        }
    }

    Object.entries(result).forEach(([key,value]) => {
        result[key] = Math.round(value * 100) / 100;
    })

    return result;
}


async function getHandler(req,res){
    const settings = await fs.readFile("./src/json/settings.json");
    return res.status(200).json(JSON.parse(settings)?.['salesTarget'])
}
function postHandler(req,res){
    return serverAdminWrapper(async (req) => {
        const body = parseBody(req);

        const settings = await fs.readFile("./src/json/settings.json").then((settings) => JSON.parse(settings));

        settings['salesTarget'] = makeSalesTargets(body?.['salesTarget'],settings?.['salesTarget']);

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
