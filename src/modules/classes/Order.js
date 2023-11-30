import {format} from "date-fns";

export default class Order {
    constructor(order) {
        this._order = order;
        this.name = order.name;
        this.orderId = order['order_id'];
        this.storeId = order['store_id'];
        this.paymentDate = format(new Date(order['payment_date']), "MM/dd/yyyy");
        this.paymentTime = format(new Date(order['payment_date']), "HH:mm:ss");
        this.orderStatus = order['order_status'];
        this.sale_id = order.sale_id;
    }

    get items() {
        return this._order.items.map(this.processItem).flat();
    }

    get total() {
        return this.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
    }

    processItem(item) {
        try {
            return JSON.parse(item);
        } catch (e) {
            return JSON.parse("[" + item + "]");
        }
    }
}