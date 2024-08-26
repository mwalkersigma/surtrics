import findStartOfWeek from "./findSundayFromDate";
import {nextSaturday} from "date-fns";

export default function getStartAndEndWeekString(date){
    let startOfWeek = findStartOfWeek(date);

    let endOfWeek = new Date(startOfWeek);
    endOfWeek = nextSaturday(endOfWeek);

    let endOfWeekString = endOfWeek.toDateString().split("T")[0];
    let startWeekString = startOfWeek.toDateString().split("T")[0];

    return [startWeekString, endOfWeekString];
}