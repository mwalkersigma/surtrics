export default function processWeekData(weekData){
    return Object.values(weekData.reduce((acc, curr) => {
        //todo remove this logic change
        let date = curr?.timestamp?.split("T")[0] || curr?.date.split("T")[0];
        if(!acc[date]){
            acc[date] = {
                date,
                count:+curr.count,
                [curr['transaction_reason']]: +curr.count,
            }
            return acc;
        }
        acc[date].count += +curr.count;
        acc[date][curr['transaction_reason']] = +curr.count;
        return acc;
    },{}))
}