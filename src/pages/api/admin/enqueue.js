import queueChanges from "../../../modules/utils/queueChanges";


export default function handler (req,res){
    let changes = req.body;
    if(typeof changes === "string")changes = JSON.parse(changes);
    if(Array.isArray(changes)) {
        changes.forEach(queueChanges)
        return res.status(200).json({changes,success:true});
    }
    queueChanges(changes);
    return res.status(200).json({changes,success:true});

}