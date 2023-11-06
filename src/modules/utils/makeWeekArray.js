import findStartOfWeek from "./findSundayFromDate";
import {addDays, format} from "date-fns";



/*
    @function makeWeekArray
    @param {Array} weekData - Array of objects with date and count
    @param {Date} sunday - Date object representing the sunday of the week
    @description = When given an array of objects with a count and date property,
    it orders those objects into an array and inserts the missing days of the week.
    @returns {Array} - Array of objects with date and count with a length of 7.
    Starting with sunday and ending with saturday.

 */
export default function makeWeekArray (weekData,sunday=new Date()){
    let firstDayOfWeek = findStartOfWeek(sunday);
    let weekSeed = Array.from({length: 7}, (_,i) => ({date:format(addDays(firstDayOfWeek,i),"yyyy-MM-dd"),count:0}));
    if(weekData.length === 0) return weekSeed;
    return weekSeed.map(({date}) => {
        let sameDay = weekData.find((item) => item.date === date);
        if(sameDay) return sameDay;
        return {date,count:0};
    })
}