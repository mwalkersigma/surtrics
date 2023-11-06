const fs = require("fs");

let results = [];
const shipStationToken = "" ;

function buildURL(base_url, endpoint, options) {
    let url = new URL(base_url + endpoint);
    let temp = JSON.parse(JSON.stringify(options))
    Object.keys(temp).forEach((key) => {
        if (key.toLowerCase().includes('date')) {
            temp[key] = new Date(temp[key]).toISOString().split("T")[0];
        }
        url.searchParams.append(key, temp[key])
    })
    return url
}
async function getShipStationOrders() {
    const baseUrl = "https://ssapi.shipstation.com";
    const endpoint = "/orders";
    let options = {
        pageSize: 500,
        paymentDateStart: "05-01-2023",
    }
    let results = [];
    while (true) {
        let fullUrl = buildURL(baseUrl, endpoint, options).href;
        console.log(fullUrl);
        let headers ={
            "Authorization": "Basic " + shipStationToken
        }
        let response = await fetch(fullUrl, {
            method: "GET",
            headers: headers
        });
        const {status, statusText} = response;
        if(status !== 200) {
            break;
        }
        let data = await response.json();
        const {page,pages,total,orders} = data;
        results = results.concat(orders);
        if(page === pages) {
            break;
        }
        options.page = page + 1;
        console.log(`Page ${page} of ${pages} retrieved`)
        console.log(`Total orders retrieved: ${results.length}`)
    }
    return results;
}

let writeStream = fs.createWriteStream("../../src/json/orders.json");
getShipStationOrders()
    .then((data) => {
        writeStream.write(JSON.stringify(data,null,2));
        writeStream.end();
    })
    .catch((err) => {
        console.log(err);
    });