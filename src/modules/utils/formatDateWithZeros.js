const formatDateWithZeros = (date) => {
    let month = `${(date.getMonth() + 1).length > 1 ? "" : "0"}${date.getMonth() + 1}`;

    let day = `${`${date.getDate()}`.length > 1 ? "" : "0"}${date.getDate()}`;
    return `${date.getFullYear()}-${month}-${day}`
}
export default formatDateWithZeros