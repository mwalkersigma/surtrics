const fs = require("fs");
const fsp = require("fs/promises");

let fileContents = fs.createReadStream(`../../../src/data/InventoryExport_10-3-2023-18-0-4-953.txt`);
let count = 0;
let results = [];
let headers ;
fileContents.on('data', (chunk) => {
    let data = chunk
        .toString()
        .split("\n")
        .map(line => line.split("\t"));

    if(count === 0) {
        headers = data.splice(0, 1)[0];
        count++;
    }
    data.forEach(line => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = line[index];
        })
        results.push(obj)
    })



});
fileContents.on('close', () => {

    console.log('No more data in response.');
    console.log(results[1000])
    // Object.entries(results).forEach(([sku,price]) => {
    //     let isNumber = !!+price;
    //     if(!isNumber){
    //         delete results[sku];
    //     }else{
    //         results[sku] = +price;
    //     }
    //     count++;
    // })
    // console.log("Finished parsing file.")
    // fsp.writeFile("./src/json/CA.update.json",JSON.stringify(results,null,2))
    //     .then(() => console.log("Finished writing file."))
    //     .then(() =>{
    //         console.log("Finished deleting file.")
    //         console.log("Finished Channel Advisor Route.")
    //     })
    //     .then(()=>{
    //         fsp.readdir(`${outputFolder}/`)
    //             .then(filesToClean =>{
    //                 filesToClean.forEach(file => {
    //                     fsp.unlink(`${outputFolder}/${file}`);
    //                 })
    //             })
    //     })
    //     .catch(err => console.log(err))
    //     .finally(()=>{
    //         fs.writeFileSync("./src/json/access_token.json",JSON.stringify({
    //             time: null,
    //             access_token: null,
    //             export_token: null
    //         }));
    //     })

})