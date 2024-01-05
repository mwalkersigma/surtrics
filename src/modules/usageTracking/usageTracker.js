const fs = require('fs');
const path = require('path');
const Random = require('another-random-package')

class Visit {
    constructor({timeStamp,parentKey,key}){
        this.timeStamp = timeStamp;
        this.parentKey = parentKey;
        this.key = key;
    }
}


class User {
    constructor({name,email,image,_visits=[],useCount=0,uuid=Random.randomStringAlphaNumeric(25)}){
        this.name = name;
        this.email = email;
        this.image = image;
        this._visits = _visits;
        this.useCount = useCount;
        this.uuid = uuid;
    }
    addVisit(visit){
        this._visits.push(new Visit(visit));
        this.useCount += 1;
    }
    get visits(){
        return this._visits.map((visit)=>new Visit(visit));
    }

    get lastVisit(){
        return new Visit(this._visits.reduce((acc,visit)=>{
            if(!acc) return visit;
            if(new Date(visit.timeStamp) > new Date(acc.timeStamp)) return visit;
            return acc;
        },null));
    }

    get daysSinceLastVisit(){
        if(!this.lastVisit) return null;
        return Math.floor((new Date() - new Date(this.lastVisit.timeStamp))/(1000*60*60*24));
    }

    get pageUsage(){
        return this.visits.reduce((acc,visit)=>{
            if(!acc[visit.parentKey]){
                acc[visit.parentKey] = {};
            }
            if(!acc[visit.parentKey][visit.key]){
                acc[visit.parentKey][visit.key] = 0;
            }
            acc[visit.parentKey][visit.key]++;
            return acc;
        },{})
    }

}



function createFileIfNeeded(filepath) {
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, JSON.stringify({}));
    }
}

export default function logUsage (parentKey,key,user) {
    const filepath = path.join('./src/json/', 'usageTracker.json');
    createFileIfNeeded(filepath);
    const usageTracker = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if(!usageTracker['users']){
        usageTracker['users'] = {};
    }

    if(user && user.email !== "undefined" && user.email !== undefined){
           if(!usageTracker['users'][user.email]){
               usageTracker['users'][user.email] = new User(user);
           }

           let userObj = new User(usageTracker['users'][user.email]);

           userObj.addVisit({
               timeStamp:new Date(),
               parentKey,
               key
           });

           usageTracker['users'][user.email] = userObj;

    }

    if (!usageTracker[parentKey]) {
        usageTracker[parentKey] = {};
    }
    if (!usageTracker[parentKey][key]) {
        usageTracker[parentKey][key] = 0;
    }
    usageTracker[parentKey][key] += 1;
    fs.writeFileSync(filepath, JSON.stringify(usageTracker,null,2));
}