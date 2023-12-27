export default function normalize(minIn, maxIn, minOut, maxOut) {
    return (value)=> {
        if(value > maxIn) return maxOut;
        if(value < minIn) return minOut;
        return (value - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
    }
}