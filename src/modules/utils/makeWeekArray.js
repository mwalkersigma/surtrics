import findSunday from "./findMondayFromDate";

export default function makeWeekArray (weekData,hasOffset,sunday = new Date()){
    if(sunday.getDay() !== 0) sunday = findSunday(sunday);
    let weekSeed = Array.from({length: 7}, (_,i) => {
        let tempDate = new Date(sunday);
        tempDate.setDate(tempDate.getDate() + i - (hasOffset ?  1 : 0));
        return {date:tempDate.toISOString().split("T")[0],count:0};
    })
    console.log(weekSeed)
    if(weekData.length === 0) return weekSeed;
    return weekSeed.map(({date}) => {
        let found = weekData.find((item) => item.date.split("T")[0] === date);
        if(found) return found;
        return {date,count:0};
    })
}