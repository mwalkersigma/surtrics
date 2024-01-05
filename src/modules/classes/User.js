const Random = require("another-random-package");

class Visit {
    constructor({timeStamp,parentKey,key}){
        this.timeStamp = timeStamp;
        this.parentKey = parentKey;
        this.key = key;
    }
}


export default class User {
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