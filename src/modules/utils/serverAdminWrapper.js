import {auth} from "../../pages/api/auth/[...nextauth]";
import fs from "fs/promises";

export default function serverAdminWrapper( cb ) {
    return async (req,res) => {
        try {
            const session = await auth(req, res);
            if (!session) {
                return "You must be logged in."
            }
            let adminList = await fs.readFile("./src/json/adminList.json").then((res)=>JSON.parse(res));
            adminList = adminList.map(admin=> admin.toLowerCase());
            if (!adminList.includes(session.user.email.toLowerCase())) {
                return "You must be an admin to use this route."
            }
            return await cb(req,res,session)
        } catch (e) {
            throw e.message
        }
    }
}