import fs from "fs/promises";
import Logger from "sigma-logger";


const convertFrequencyToSeconds = (frequency) => {
    switch (frequency) {
        case "every minute":
            return 60;
        case "every 5 minutes":
            return 300;
        case "every 15 minutes":
            return 900;
        case "every half hour":
            return 1800;
        case "every hour":
            return 3600;
        case "daily":
            return 86400;
        case "weekly":
            return 604800;
    }
}
export async function isTimeToUpdate(currentTimestamp, timeLastUpdated){
    let {frequency} = await fs
        .readFile("./src/json/settings.json", "utf-8")
        .then((data) => JSON.parse(data));
    Logger.log(`frequency: ${frequency} `)
    frequency = convertFrequencyToSeconds(frequency);
    let timeDiff = (new Date(currentTimestamp) - new Date(timeLastUpdated)) / 1000;

    Logger.log(`timeDiff: ${timeDiff} `)
    return timeDiff < frequency
}