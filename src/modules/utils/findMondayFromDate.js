import {isSunday, isMonday, getDay, addHours, previousSunday, previousMonday} from "date-fns";

function findSunday(date){
    if(isSunday(date)){
        return date;
    }
    return previousSunday(date);
}

function findMonday(date){
    if(isMonday(date)){
        return date;
    }
    return previousMonday(date);
}



export default function findStartOfWeek(date, useSunday = false) {
    date = addHours(date, 5);
    if(useSunday){
        date = findSunday(date);
    }
    date = findMonday(date);
    return date
}