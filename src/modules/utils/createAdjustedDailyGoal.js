let createAdjustedGoal = (dailyGoal,dailyData) => {
    if(dailyData.length === 0)return dailyGoal;
    let QuantityForCurrentHour = dailyGoal[0];
    let hours = dailyData.length;
    let expectedTotal = QuantityForCurrentHour * hours;
    let actualTotal = dailyData?.reduce((a,b) => a + b);
    let difference = expectedTotal - actualTotal;
    if(difference < 0)return dailyGoal;
    let remainingHours = dailyGoal.length - dailyData.length;
    let makeUpPerHour = (difference / remainingHours) || 0;
    return dailyGoal.map((hourlyGoal,i) => {
        if(i >= dailyData.length){
            return hourlyGoal + makeUpPerHour;
        }else{
            return hourlyGoal;
        }
    })
}

export default createAdjustedGoal;