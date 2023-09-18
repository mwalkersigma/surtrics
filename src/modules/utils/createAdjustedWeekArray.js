export default function createAdjustedWeekArray(data, goal) {
    let weekGoal = goal * data.filter(day=> day.count !== 0).length
    let weekTotal = data.reduce((acc, curr) => {
        return acc + curr.count;
    },0);

    let days = data.filter(day=> day.count !== 0).length;
    let daysRemaining = 5 - days;
    daysRemaining = daysRemaining <= 0 ? 1 : daysRemaining;

    let baseWeek = Array(5).fill(0);

    let weekDifference = (weekGoal - weekTotal) / daysRemaining;

    if(weekDifference > 0) {
        baseWeek.splice(5 - daysRemaining, daysRemaining, ...Array(daysRemaining).fill(weekDifference));
    }

    return baseWeek;
}