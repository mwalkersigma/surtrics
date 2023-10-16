import findStartOfWeek from "./findSundayFromDate";

export default function makeWeekArray (weekData,sunday=new Date()){
    sunday = findStartOfWeek(sunday);
    let weekSeed = Array.from({length: 7}, (_,i) => {
        let tempDate = new Date(sunday);
        tempDate.setDate(tempDate.getDate() + i);
        return {date:tempDate.toISOString(),count:0};
    });
    if(weekData.length === 0) return weekSeed;
    return weekSeed.map(({date}) => {
        let found = weekData.find((item) => item.date.split("T")[0] === date.split("T")[0]);
        if(found) return found;
        return {date,count:0};
    })
}