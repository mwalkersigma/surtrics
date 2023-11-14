import getStartAndEndWeekString from "./getStartAndEndWeekString";
import {addDays, addHours} from "date-fns";
import formatDateWithZeros from "./formatDateWithZeros";
import findStartOfWeek from "./findSundayFromDate";

export default function makeDateArray(date){
    const startString = findStartOfWeek(addDays(new Date(date),1)).toLocaleDateString();


    let dates = [];

    for(let day = 0 ; day < 7 ; day++){
        let date = new Date(startString);
        date = addHours(date,5);
        date = addDays(date,day);
        dates.push(formatDateWithZeros(date));
    }
    return dates;
}