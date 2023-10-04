export default function formatDatabaseRows(rows){
    let result = {};
    for(let i = 0 ; i < rows.length ; i++){
        let {name, type, reason, sum, date} = rows[i];
        date = date.split("T")[0];
        if(!result[name]){
            result[name] = {};
        }
        if(!result[name][date]){
            result[name][date] = {};
        }
        if(!result[name][date][`${type} ${reason}`]){
            result[name][date][`${type} ${reason}`] = 0;
        }
        result[name][date][`${type} ${reason}`] += +sum;
    }

    for(let user in result){
        for(let date in result[user]){
            let sum = 0;
            for(let transaction in result[user][date]){
                sum += result[user][date][transaction];
            }
            result[user][date]["Total"] = sum;
        }
    }
    return result;
}