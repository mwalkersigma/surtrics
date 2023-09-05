export default function makeWeekArray (weekData,monday = new Date()){
    let weekSeed = Array.from({length: 7}, (_,i) => {
        let tempDate = new Date(monday);
        tempDate.setDate(tempDate.getDate() + i - 1);
        return {date:tempDate.toISOString().split("T")[0],count:0};
    })
    if(weekData.length === 0) return weekSeed;
    return weekSeed.map(({date}) => {
        let found = weekData.find((item) => item.date.split("T")[0] === date);
        if(found) return found;
        return {date,count:0};
    })
}