import useUpdates from "./useUpdates";
import Order from "../classes/Order";

export default function useOrders (config,options) {
    const sales = useUpdates("/api/views/sales",config);

    let orders = sales
        .map(sale => new Order(sale))
        .filter(order => order.orderStatus !== 'cancelled');

    let acceptedConditions = ["1", "2", "3", "4"];

    if (options?.acceptedConditions){
        acceptedConditions = options.acceptedConditions;
    }

    orders = orders.filter(order => {
        let items = order.items;
        order.items = items.filter(item=>{
            let sku = `${item.sku}`;
            let hasSku = sku !== '';
            if(hasSku){
                let isNewSku = sku.includes("-");
                if(isNewSku){
                    let condition = sku.split('-')[1];
                    return acceptedConditions.includes(condition)
                }
            }
            return false
        })
        return order.items !== 0;
    })

    return orders;

}