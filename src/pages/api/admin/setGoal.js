import processChanges from "../../../modules/utils/processChanges";
import Logger from "sigma-logger";


export default function handler (req,res) {
    if(typeof req.body === "string")req.body = JSON.parse(req.body);
    Logger.log(`The goal was updated to ${req.body.value}`);
    let changes = processChanges([{...{filePath:"./src/json/settings.json",key:"weeklyGoal"},...req.body}]);
    return res.status(200).json({changes});
}