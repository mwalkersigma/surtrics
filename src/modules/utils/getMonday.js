export default function getMonday(){
    let date = new Date();
    let day = date.getDay();
    let diff = date.getDate() - day + (day === 0 ? -6:1);
    if(day > 0 && day < 6){
        // returns this monday
        return new Date(date.setDate(diff));
    }else{
        // returns next monday
        return new Date(date.setDate(diff + 7));
    }
}