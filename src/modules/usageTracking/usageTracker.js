import User from "../classes/User";

const fs = require('fs');
const path = require('path');
const Random = require('another-random-package')





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