import useUpdates from "./useUpdates";
import Order from "../classes/Order";

export default function useOrders (config,options) {
    const sales = useUpdates("/api/views/sales",config);


    let orders = sales.map(sale => new Order(sale))
         .filter(order => order.orderStatus !== 'cancelled')
         .filter(order => order.items.length !== 0)

    let acceptedConditions = ["1", "2", "3", "4"];

    if (options?.acceptedConditions){
        acceptedConditions = options.acceptedConditions;
    }


    return orders
        .filter(order => {
            let filteredItems = order.items.filter(item =>{
                let sku = `${item.sku}`;
                if (sku === "" || !sku.includes("-")){
                    return true;
                }
                let condition = sku.split("-")[1];
                return acceptedConditions.includes(condition);
            });
            return filteredItems.length >= 1
        });

}