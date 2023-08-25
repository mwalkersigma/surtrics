import Bottleneck from "bottleneck";

export default function APILimiter(quantity,timeframe,maxConcurrent=5){
    // Time frame will be given in minutes, and we want to convert it to milliseconds.
    timeframe = timeframe * 60 * 1000;
    return new Bottleneck({
        reservoir: quantity, // initial value
        reservoirRefreshAmount: quantity,
        reservoirRefreshInterval: timeframe, // must be divisible by 250
        maxConcurrent: maxConcurrent,
    })
}