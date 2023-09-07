export default function findSunday(date) {
    if(!date instanceof Date) throw new Error("Invalid Date");
    if(date.getHours() === 19) date.setDate(date.getDate() + 1);
    const d = date.toString().split(" ");
    const [dayName] = d;
    switch (dayName) {
        case "Sun":
            return date;
        case "Mon":
            date.setDate(date.getDate() - 1);
            return date;
        case "Tue":
            date.setDate(date.getDate() - 2);
            return date;
        case "Wed":
            date.setDate(date.getDate() - 3);
            return date;
        case "Thu":
            date.setDate(date.getDate() - 4);
            return date;
        case "Fri":
            date.setDate(date.getDate() - 5);
            return date;
        case "Sat":
            date.setDate(date.getDate() - 6);
            return date;
        default:
            throw new Error("Invalid Date");
    }
}