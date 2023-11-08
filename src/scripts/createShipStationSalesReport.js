const fs = require("fs");


const {subHours} = require("date-fns");

const path = "../json/orders.json";
let file = fs.readFileSync(path);
let orders = JSON.parse(file);

const startDate = new Date('2023-10-23');
const [year, month, day] = startDate.toISOString().split('T')[0].split('-');
let startDateString = `${year}-${month}-${day}`;

let salesBetweenShipDates = orders
    .filter(({paymentDate}) => subHours(new Date(paymentDate), 2).toISOString()?.split("T")[0] === startDateString)
    .filter(({orderStatus}) => orderStatus === 'shipped');
console.log(`Total orders: ${salesBetweenShipDates.length}`);
Object.entries(salesBetweenShipDates.reduce((acc, {advancedOptions: {storeId}, items}) => {
    if (!acc[storeId]) acc[storeId] = [];
    acc[storeId].push(items);
    return acc;
}, {})).forEach(([storeId, items]) => {
    let flatItems = items.flat();
    let bySku = flatItems.reduce((acc, {sku, name, quantity, unitPrice}) => {
        if (!acc[sku]) acc[sku] = {name};
        acc[sku].quantity = (acc[sku].quantity || 0) + quantity;
        acc[sku].revenue = (acc[sku].revenue || 0) + quantity * unitPrice;
        return acc;
    }, {})
    bySku["TOTAL"] = flatItems.reduce((acc, {quantity, unitPrice}) => {
        acc.quantity = (acc.quantity || 0) + quantity;
        acc.revenue = (acc.revenue || 0) + quantity * unitPrice;
        return acc;
    }, {})
    console.log(`Store ID: ${storeId}`);
    console.log(Object.keys(bySku).length + " Items");
    console.table(bySku);
})
