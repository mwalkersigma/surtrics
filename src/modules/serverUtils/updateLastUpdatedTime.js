import fs from "fs/promises";

export default async function updateLastUpdatedTime(tokenName,value=new Date().toISOString()){
    let currentTimestampObject = await fs.readFile("./src/json/timeLastUpdated.json", "utf-8")
        .then((data) => JSON.parse(data));
    currentTimestampObject.timeLastUpdated[tokenName] = value;
    await fs.writeFile("./src/json/timeLastUpdated.json", JSON.stringify(currentTimestampObject, null, 2))
}