import {format} from "date-fns";

export default class Order {
    constructor(order) {
        this._order = order;
        this.name = order.name;
        this.orderId = order['order_id'];
        this.storeId = order['store_id'];
        this.timeStamp = order['payment_date_utc'];
        this.paymentDate = format(new Date(this.timeStamp), "MM/dd/yyyy");
        this.paymentTime = format(new Date(this.timeStamp), "HH:mm:ss");
        this.orderStatus = order['order_status'];
        this._items = null;
    }

    get items() {
        if(this._items === null){
            this._items = this.processItems(this._order);
        }
        return this._items;
    }

    set items(items){
        this._items = items;

    }

    get total() {
        return Number(this.items.reduce((total, item) => Number(total) + Number(item.unitPrice) * Number(item.quantity), 0));
    }

    processItems(order) {
        if(!this._items) {
            const {names, quantities_sold, sale_ids, skus, sold_prices} = order
            this._items = names.map((name, index) => {
                return {
                    name,
                    quantity: quantities_sold[index],
                    sku: skus[index],
                    unitPrice: sold_prices[index]
                }
            })
        }
        return this._items;
    }
}