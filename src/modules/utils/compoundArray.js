export default function compoundArray(arr){
    return arr.map((item, index, orig) => {
        if(index === 0){
            return item
        }
        return orig.slice(0, index + 1).reduce((acc, curr) => acc + curr);
    })
}