import fs from "fs/promises";

export default async function getLastUpdatedTime(tokenName){
    const {timeLastUpdated} = await fs
        .readFile("./src/json/timeLastUpdated.json", "utf-8")
        .then((data) => JSON.parse(data));

    return timeLastUpdated[tokenName];
}