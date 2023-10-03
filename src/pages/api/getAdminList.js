import fs from "fs/promises"
export default function handler (req,res) {
    return fs.readFile("./src/json/adminList.json")
        .then((data)=>{res.status(200).json(JSON.parse(data))})
        .catch((err)=>{res.status(500).json({error:err})})

}