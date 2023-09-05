let createAdjustedGoal = (dailyGoal,dailyData) => {
    console.log("--------------------")
    if(dailyData.length === 0)return dailyGoal;
    console.log("dailyGoal: ", dailyGoal)
    let QuantityForCurrentHour = dailyGoal[0];
    console.log("QuantityForCurrentHour: ", QuantityForCurrentHour)
    let hours = dailyData.length;
    console.log("hours: ", hours)
    let expectedTotal = QuantityForCurrentHour * hours;
    console.log("expectedTotal: ", expectedTotal)
    let actualTotal = dailyData?.reduce((a,b) => a + b);
    console.log("actualTotal: ", actualTotal)
    let difference = expectedTotal - actualTotal;
    console.log("difference: ", difference)
    if(difference < 0)return dailyGoal;
    let remainingHours = dailyGoal.length - dailyData.length;
    console.log("remainingHours: ", remainingHours)
    let makeUpPerHour = (difference / remainingHours) || 0;
    console.log("makeUpPerHour: ", makeUpPerHour)
    console.log("--------------------")
    return dailyGoal.map((hourlyGoal,i) => {
        if(i >= dailyData.length){
            return hourlyGoal + makeUpPerHour;
        }else{
            return hourlyGoal;
        }
    })
}

export default createAdjustedGoal;