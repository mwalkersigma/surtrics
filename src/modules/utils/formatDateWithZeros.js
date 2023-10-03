const formatDateWithZeros = (date) => {
    let month = `${(date.getMonth() + 1)}`.padStart(2,"0");
    let day = `${(date.getDate())}`.padStart(2,"0");
    return `${date.getFullYear()}-${month}-${day}`
}
export default formatDateWithZeros