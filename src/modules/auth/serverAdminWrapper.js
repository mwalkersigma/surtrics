import {auth} from "../../pages/api/auth/[...nextauth]";
import fs from "fs/promises";

export default function serverAdminWrapper( cb , ...options ) {
    return async (req,res) => {
        try {
            const session = await auth(req, res);
            if (!session) {
                return "You must be logged in."
            }
            let adminList = await fs.readFile("./src/json/adminList.json").then((res)=>JSON.parse(res));
            let email = session['user'].email.toLowerCase();
            let user = adminList.find(admin=>admin.email.toLowerCase() === email);
            if(!user){
                return "User doesn't have roles setup"
            }
            let authorizedRoles = ["admin"];
            if(options){
                authorizedRoles = authorizedRoles.concat(options);
            }
            let isAuthorized = user.roles.map(role=>authorizedRoles.includes(role)).includes(true);
            if(!isAuthorized){
                return "User doesn't have the correct roles"
            }
            return await cb(req,res,session)
        } catch (e) {
            throw e.message
        }
    }
}
