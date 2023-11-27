import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";
const fs = require('fs');

function getHandler(){
    let settings = JSON.parse(fs.readFileSync('./src/json/settings.json', 'utf8'));
    return settings.Errors;
}
function postHandler(req){
    const {name,definition,assigned} = req.body;
    let settings = JSON.parse(fs.readFileSync('./src/json/settings.json', 'utf8'));
    let hasError = settings.Errors.filter((error)=>error.name === name);
    if(hasError.length > 0) return `${name} already exists`;
    settings.Errors.push({name,definition,assigned});
    fs.writeFileSync('./src/json/settings.json', JSON.stringify(settings,null,2));
    return `${name} has been added to the error list`

}
function putHandler(){
    return {message:"Not Implemented Yet"}
}
function patchHandler(){
    return {message:"Not Implemented Yet"}
}
function deleteHandler(req){
    const {name} = parseBody(req);
    let settings = JSON.parse(fs.readFileSync('./src/json/settings.json', 'utf8'));
    settings.Errors = settings.Errors.filter((error)=>error.name !== name);
    fs.writeFileSync('./src/json/settings.json', JSON.stringify(settings,null,2));
    return `${name} has been removed from the error list`
}




export default function handler ( req, res ) {
    return serverAdminWrapper(async ( req, res ) => {
        return router({
            GET: getHandler,
            POST: postHandler,
            PUT: putHandler,
            PATCH: patchHandler,
            DELETE: deleteHandler
        })(req,res)
    })(req,res)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => {
            res.status(500).json({error});
        });
}