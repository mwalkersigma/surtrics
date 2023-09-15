export default function createAdjustedGoal(week, goal) {
    let daysRemaining = 5 - week.filter(({count}) => count > 0).length
    daysRemaining = daysRemaining === 0 ? 1 : daysRemaining;
    let totalCount = week.map((item) => +item["count"] || 0).reduce((acc, cur) => acc + cur, 0);
    let weekGoal = goal * 5;
    return (weekGoal - totalCount) / daysRemaining;
}