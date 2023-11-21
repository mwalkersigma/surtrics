import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import router from "../../../modules/serverUtils/requestRouter";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import fs from "fs";

function getHandler(req,res,...options){
    let userList = fs.readFileSync("./src/json/adminList.json")
        userList = JSON.parse(`${userList}`);

    return userList;
}
function postHandler(req,res,...options){
    let userList = fs.readFileSync("./src/json/users.json")
        userList = JSON.parse(`${userList}`);

    let email = req.body.user.email;

    let emails = userList.map((user)=>user.email);
    if(emails.includes(email)){
        return {message:"User already exists"}
    }

    userList.push({
        email:req.body.user.email,
        name:req.body.user.name,
        roles:req.body.user.roles
    });

    fs.writeFileSync("./src/json/users.json",JSON.stringify(userList));

    return {message:"User added"}
}
function putHandler(req,res,...options){
    // update all users
    let newState = parseBody(req)['newState'];

    fs.writeFileSync("./src/json/adminList.json",JSON.stringify(newState,null,2));
    return newState
}
function patchHandler(req,res,...options){
    // update single user
    return {message:"User updated"}
}
function deleteHandler(req,res,...options){
    // delete single user
    req.body = parseBody(req);
    let adminList = fs.readFileSync("./src/json/adminList.json")
        adminList = JSON.parse(`${adminList}`);

    let email = req.body.email;

    let emails = adminList.map((user)=>user.email);
    if(!emails.includes(email)){
        return {message:"User does not exist"}
    }

    adminList = adminList.filter((user)=>user.email !== email);

    fs.writeFileSync("./src/json/adminList.json",JSON.stringify(adminList,null,2));

    return "User deleted"
}

/*
  {
    "name": "Mike Walker",
    "email": "mwalker@sigmaequipment.com",
    "roles": ["admin","dev"]
  }
*/


export default function handler ( req, res ) {
    return serverAdminWrapper((req, res) => {

        return router({
            GET: getHandler,
            POST: postHandler,
            PUT: putHandler,
            PATCH: patchHandler,
            DELETE: deleteHandler,
        })(req, res)
    })(req, res)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => {
            res.status(500).json({error});
        });
}