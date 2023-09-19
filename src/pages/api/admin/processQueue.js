import fs from "fs";
import processChanges from "../../../modules/utils/processChanges";
import Logger from "sigma-logger";


export default function handler (req, res) {
    let queue = fs.readFileSync("./src/json/queue.json");
    queue = JSON.parse(`${queue}`);
    Logger.log(`The queue was processed : ${queue}`);
    let changelog = processChanges(queue);
    fs.writeFileSync("./src/json/queue.json",JSON.stringify([]));
    return res.status(200).json({message:changelog});
}