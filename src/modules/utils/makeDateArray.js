import getStartAndEndWeekString from "./getStartAndEndWeekString";
import {addDays, addHours} from "date-fns";
import formatDateWithZeros from "./formatDateWithZeros";

export default function makeDateArray(date){
    console.log(date)
    const [startString] = getStartAndEndWeekString(new Date(date));

    let dates = [startString];

    for(let day = 1 ; day < 7 ; day++){
        let date = new Date(startString);
        date = addHours(date,5);
        date = addDays(date,day);
        dates.push(formatDateWithZeros(date));
    }
    return dates;
}