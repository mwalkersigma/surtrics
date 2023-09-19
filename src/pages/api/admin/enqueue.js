import queueChanges from "../../../modules/utils/queueChanges";
import Logger from "sigma-logger";


export default function handler (req,res){
    let changes = req.body;
    if(typeof changes === "string")changes = JSON.parse(changes);
    if(Array.isArray(changes)) {
        changes.forEach(queueChanges)
        return res.status(200).json({changes,success:true});
    }
    Logger.log(`The following changes were queued: ${changes}`);
    queueChanges(changes);
    return res.status(200).json({changes,success:true});

}