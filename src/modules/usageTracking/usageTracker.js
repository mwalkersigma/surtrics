const fs = require('fs');
const path = require('path');




function createFileIfNeeded(filepath) {
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, JSON.stringify({}));
    }
}

export default function logUsage (parentKey,key) {
    const filepath = path.join('./src/json/', 'usageTracker.json');
    createFileIfNeeded(filepath);
    const usageTracker = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (!usageTracker[parentKey]) {
        usageTracker[parentKey] = {};
    }
    if (!usageTracker[parentKey][key]) {
        usageTracker[parentKey][key] = 0;
    }
    usageTracker[parentKey][key] += 1;
    fs.writeFileSync(filepath, JSON.stringify(usageTracker));
}