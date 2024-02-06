export default function createAdjustedWeekArray(data, goal) {
    // Week Goal
    // Takes the daily goal and multiplies it by the number of days that have been tracked
    // This gives us the running total of the goal for the week
    let weekGoal = goal * data.filter(day=> day.count !== 0).length
    // weekTotal
    // Takes the data and reduces it to a single value
    // This gives us the running total of the count for the week
    let weekTotal = data.reduce((acc, curr) => {
        return acc + curr.count;
    },0);
    console.log("weekGoal", weekGoal);
    console.log("weekTotal", weekTotal);

    let days = data.filter(day=> day.count !== 0).length + 1;
    let daysRemaining = 5 - days;
    daysRemaining = daysRemaining <= 0 ? 1 : daysRemaining;

    let baseWeek = Array(days).fill(0);

    let weekDifference = (weekGoal - weekTotal) / daysRemaining;

    if(weekDifference > 0) {
        baseWeek.splice(days - daysRemaining, daysRemaining, ...Array(daysRemaining).fill(weekDifference));
    }
    console.log("baseWeek", baseWeek);
    return baseWeek;
}