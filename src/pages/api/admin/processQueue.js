import fs from "fs";
import processChanges from "../../../modules/utils/processChanges";


export default function handler (req, res) {
    let queue = fs.readFileSync("./src/json/queue.json");
    queue = JSON.parse(`${queue}`);
    console.log(queue);
    let changelog = processChanges(queue);
    fs.writeFileSync("./src/json/queue.json",JSON.stringify([]));
    return res.status(200).json({message:changelog});
}