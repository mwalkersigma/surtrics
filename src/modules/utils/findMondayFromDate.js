export default function findMonday(date) {
    let day = date.getDay();
    let monday = new Date(date);
    monday.setDate(monday.getDate() - day + 1);
    return monday;
}