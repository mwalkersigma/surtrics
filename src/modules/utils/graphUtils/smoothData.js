function findLinearTrendLine(data) {
    const n = data.length;

    // Calculate sums
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += data[i][0];
        sumY += data[i][1];
        sumXY += data[i][0] * data[i][1];
        sumX2 += data[i][0] * data[i][0];
    }

    // Calculate slope (m) and y-intercept (b) of the trendline
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Create the trendline function
    const trendline = (_,x) => slope * x + intercept;

    return data.map(trendline)
}

export default function smoothData(data,adjCount=3) {
    if(!data) return [];
    if(adjCount === 0) return data;
    if(adjCount === 8){
        if(Array.isArray(data)){
            return findLinearTrendLine(data.map((x,i) => [i+1,x]));
        }
        return findLinearTrendLine(Object.values(data).map((x,i) => [i+1,x]));
    }

    let newData = [];
    for(let i = 0; i < data.length; i++) {
        let sum = 0;
        if(i < adjCount) {
            for(let j = 0; j < i + adjCount; j++) {
                sum += data[j];
            }
            newData.push(sum / (i + adjCount));
            continue;
        }

        if(i > data.length - adjCount) {
            for(let j = i - adjCount; j < data.length; j++) {
                sum += data[j];
            }
            newData.push(sum / (data.length - i + adjCount));
            continue;
        }

        for(let j = i - adjCount; j < i + adjCount; j++) {
            sum += data[j];
        }
        newData.push(sum / (adjCount * 2 + 1));
    }
    return newData;
}