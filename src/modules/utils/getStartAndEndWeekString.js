import findStartOfWeek from "./findMondayFromDate";

export default function getStartAndEndWeekString(date){
    let startOfWeek = findStartOfWeek(date);
    startOfWeek.setDate(startOfWeek.getDate() - 1);

    let endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 8);

    let endOfWeekString = endOfWeek.toISOString().split("T")[0];
    let startWeekString = startOfWeek.toISOString().split("T")[0];
    return [startWeekString, endOfWeekString];
}