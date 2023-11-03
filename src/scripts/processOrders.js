const fs = require("fs");
const path = "../json/orders.json";

let results = [];

let file = fs.readFileSync(path);
let orders = JSON.parse(file);
let orderCount = orders.length;
let items = orders.map(({items}) => items);

const orderStatuses = orders.reduce((acc, {orderStatus}) => {
    acc.add(orderStatus);
    return acc;
},new Set())

const orderStatusesArray = [...orderStatuses];
const orderStatusCount = orders.reduce((acc, {orderStatus}) => {
    acc[orderStatus] = (acc[orderStatus] || 0) + 1;
    return acc;
},{})
const salesByShipDay = orders.reduce((acc, {shipDate, orderTotal}) => {
    let date = new Date(shipDate).toDateString();
    acc[date] = (acc[date] || 0) + orderTotal;
    return acc;

},{})
const soldByDate = orders.reduce((acc, {shipDate}) => {
    let date = new Date(shipDate).toDateString();
    acc[date] = acc[date] ? acc[date] + 1 : 1;
    return acc;
},{})
console.log(salesByShipDay)
console.log(orderStatuses);
console.log(orderStatusCount);
console.log(soldByDate);
console.log(Object.values(soldByDate).reduce((acc, val) => acc + val, 0));
console.log(orderCount);
//console.log(orders.slice(100,101))
// console.log(items)


/*

[
  {
    orderId: 115686861,
    orderNumber: 'MKT#41(John)',
    orderKey: 'manual-9c1fb026223247fa990b04a26df8668d',
    orderDate: '2019-12-10T14:11:04.3530000',
    createDate: '2019-12-10T14:11:04.4130000',
    modifyDate: '2019-12-12T12:28:45.2930000',
    paymentDate: '2019-12-10T14:11:04.3530000',
    shipByDate: null,
    orderStatus: 'shipped',
    customerId: null,
    customerUsername: '',
    customerEmail: '',
    billTo: {
      name: 'Ethan Hart',
      company: null,
      street1: null,
      street2: null,
      street3: null,
      city: null,
      state: null,
      postalCode: null,
      country: null,
      phone: null,
      residential: null,
      addressVerified: null
    },
    shipTo: {
      name: 'Ethan Hart',
      company: 'CUSTOM FOODS',
      street1: '9101 COMMERCE DR',
      street2: '',
      street3: null,
      city: 'DE SOTO',
      state: 'KS',
      postalCode: '66018-8410',
      country: 'US',
      phone: '',
      residential: false,
      addressVerified: 'Address validated successfully'
    },
    items: [],
    orderTotal: 0,
    amountPaid: 0,
    taxAmount: 0,
    shippingAmount: 0,
    customerNotes: null,
    internalNotes: null,
    gift: false,
    giftMessage: null,
    paymentMethod: null,
    requestedShippingService: null,
    carrierCode: 'ups',
    serviceCode: 'ups_surepost_1_lb_or_greater',
    packageCode: 'package',
    confirmation: 'none',
    shipDate: '2019-12-13',
    holdUntilDate: null,
    weight: { value: 36, units: 'ounces', WeightUnits: 1 },
    dimensions: { units: 'inches', length: 12, width: 9, height: 3 },
    insuranceOptions: { provider: null, insureShipment: false, insuredValue: 0 },
    internationalOptions: { contents: null, customsItems: null, nonDelivery: null },
    advancedOptions: {
      warehouseId: 101920,
      nonMachinable: false,
      saturdayDelivery: false,
      containsAlcohol: false,
      mergedOrSplit: false,
      mergedIds: [],
      parentId: null,
      storeId: 64872,
      customField1: null,
      customField2: null,
      customField3: null,
      source: null,
      billToParty: null,
      billToAccount: null,
      billToPostalCode: null,
      billToCountryCode: null,
      billToMyOtherAccount: 50892
    },
    tagIds: null,
    userId: null,
    externallyFulfilled: false,
    externallyFulfilledBy: null,
    externallyFulfilledById: null,
    externallyFulfilledByName: null,
    labelMessages: null
  }
]

 */