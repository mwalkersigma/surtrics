import fs from "fs";

export default function handler (req,res) {
    let file = fs.readFileSync("./src/json/settings.json");
    file = JSON.parse(`${file}`);
    const {frequency} = file;
    return res.status(200).json({frequency});
}