import {isSunday, addHours, previousSunday} from "date-fns";

function findSunday(date){
    if(isSunday(date)){
        return date;
    }
    return previousSunday(date);
}



export default function findStartOfWeek(date) {
    date = addHours(date, 5);
    return findSunday(date);
}