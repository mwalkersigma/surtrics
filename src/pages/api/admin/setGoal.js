import processChanges from "../../../modules/utils/processChanges";


export default function handler (req,res) {
    let changeList = [];
    if(typeof req.body === "string")req.body = JSON.parse(req.body);
    changeList.push({...{filePath:"./src/json/settings.json",key:"weeklyGoal"},...req.body});
    console.log(changeList)
    let changes = processChanges(changeList);
    return res.status(200).json({changes});
}