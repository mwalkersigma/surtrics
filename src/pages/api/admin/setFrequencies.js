import processChanges from "../../../modules/utils/processChanges";
import Logger from "sigma-logger";
import {parseBody} from "../../../modules/serverUtils/parseBody";


export default function handler (req,res) {
    const body = parseBody(req.body);
    Logger.log(`The frequency was updated to ${body.value}`);
    let changes = processChanges([{...{filePath:"./src/json/settings.json",key:"frequency"},...body}]);
    return res.status(200).json({changes});
}