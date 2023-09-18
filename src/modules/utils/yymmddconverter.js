export default function yymmddTommddyy(date){
    let [year,month,day] = date.split("-");
    return `${month}-${day}-${year}`;
}