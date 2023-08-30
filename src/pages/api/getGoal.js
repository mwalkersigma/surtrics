import fs from "fs";


export default function handler (req, res) {
  let settings = fs.readFileSync("./src/json/settings.json");
    settings = JSON.parse(`${settings}`);
    const { weeklyGoal:goal } = settings;
    return res.status(200).json({ goal });
}