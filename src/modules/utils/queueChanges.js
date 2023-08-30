import fs from "fs";


export default function queueChanges (change) {
    let queue = fs.readFileSync("./src/json/queue.json");
    queue = JSON.parse(`${queue}`);
    queue.push(change);
    fs.writeFileSync("./src/json/queue.json",JSON.stringify(queue));
}