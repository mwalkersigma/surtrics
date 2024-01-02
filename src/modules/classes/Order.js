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
        return Number(this.items.reduce((total, item) => Number(total) + Number(item.unitPrice) * Number(item.quantity), 0));
    }

    processItem(item) {
        try{
            let temp = JSON.parse(item);
            let tempPrice = temp['unitPrice'];
            if(typeof tempPrice === "string"){
                tempPrice = tempPrice.replaceAll("$", "").replaceAll(',','').trim();
                temp['unitPrice'] = +tempPrice;
            }
            return temp;

        }catch (e) {
            let temp= JSON.parse("[" + item + "]");
            temp.map(item => {
                try {
                    item['unitPrice'] = item['unitPrice']?.replaceAll("$", "").replaceAll(',', '').trim();
                    return item;
                } catch (e) {
                    return item;
                }
            })
            return temp;
        }
    }
}