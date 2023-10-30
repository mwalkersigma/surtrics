import fs from "fs";


class Change {
    constructor(key,value,filePath) {
        this.key = key;
        this.value = value;
        this.filePath = filePath;
    }
}

export default function processChanges(changes) {
    let changeList = [];
    for (let change of changes) {
        let changeObj = new Change(change.key,change.value,change.filePath);
        changeList.push(changeObj);
    }

    for(let change of changeList) {
        let file = fs.readFileSync(change.filePath);
        file = JSON.parse(`${file}`);
        file[change.key] = change.value;
        fs.writeFileSync(change.filePath,JSON.stringify(file,null,2));
    }
    return 'Processed the following changes: ' +
        changeList.map(change=>`${change.filePath} had the value ${change.key.toUpperCase()} was updated to : 
        ${typeof change.value === "string" ? change.value.toUpperCase() : change.value}`).join(' \n')
        ;
}