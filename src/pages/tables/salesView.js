import React from 'react';
import Container from "react-bootstrap/Container";
import useUpdates from "../../modules/hooks/useUpdates";
import {format} from "date-fns";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import {NativeSelect, Table} from "@mantine/core";
import GraphWithStatCard from "../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";
import formatter from "../../modules/utils/numberFormatter";


class Order {
    constructor(order) {
        this._order = order;
        this.name = order.name;
        this.orderId = order.order_id;
        this.storeId = order.store_id;
        this.paymentDate = format(new Date(order.payment_date), "MM/dd/yyyy");
        this.paymentTime = format(new Date(order.payment_date), "HH:mm:ss");
        this.orderStatus = order.order_status;
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

const SalesView = () => {
    let [date, setDate] = React.useState(new Date());
    const [store, setStore] = React.useState("225004");
    let sales = useUpdates("/api/views/sales/sales", {date});

    sales = sales.map(sale => new Order(sale));
    let storeIDs = [...new Set(sales.map(sale => sale.storeId))];
    let storeSales = {};
    storeIDs.forEach(storeId => {
        storeSales[storeId] = sales.filter(sale => sale.storeId === storeId);
    });
    storeSales["All"] = sales;

    const chosenStore = storeSales[store];
    console.log(chosenStore);


    return (
        <GraphWithStatCard
            title={"Daily Sales By Channel"}
            isLoading={sales.length === 0}
            dateInput={
                <DatePickerInput
                    mb={"xl"}
                    label={"Date"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            slotOne={
                <NativeSelect
                    mb={"xl"}
                    label={"Store"}
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                >
                    <option>Choose a store</option>
                    {storeIDs.map((store, index) => <option value={`${store}`} key={index}>{store}</option>)}
                    <option value={"All"}>All</option>
                </NativeSelect>
            }
            cards={[]}
        >
            <Table captionSide="bottom" striped highlightOnHover withTableBorder withColumnBorders >
                <Table.Caption>
                    {`Total Orders: ${chosenStore && chosenStore.length}`}
                </Table.Caption>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Sku</Table.Th>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Quantity</Table.Th>
                        <Table.Th>Revenue</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {chosenStore && [...chosenStore
                        .reduce((acc, sale) => {
                                let items = sale.items;
                                items.forEach(item => {
                                    let name = item.name;
                                    let hasName = acc.has(name);
                                    if (hasName) {
                                        let current = acc.get(name);
                                        current.quantity += +item.quantity;
                                        current.total += +item.quantity * +item.unitPrice;
                                        current.total = Math.ceil(current.total * 100) / 100;
                                        acc.set(name, current);
                                    } else {
                                        acc.set(name, {...item, ...{total: Math.ceil(+item.quantity * +item.unitPrice * 100) / 100}});
                                    }
                                })
                                return acc;
                            }
                            , new Map())
                        .values()]
                        .map((item,index) => {
                                return (
                                    <Table.Tr key={item.sku + index}>
                                        <Table.Td>{item.sku}</Table.Td>
                                        <Table.Td>{item.name}</Table.Td>
                                        <Table.Td>{item.quantity}</Table.Td>
                                        <Table.Td>{formatter(item.total,'currency')}</Table.Td>
                                    </Table.Tr>
                                )
                            }
                        )}
                </Table.Tbody>
                <Table.Tfoot>
                    <Table.Tr>
                        <Table.Th>Total</Table.Th>
                        <Table.Th></Table.Th>
                        <Table.Th>{chosenStore && chosenStore.reduce((total, sale) => total + sale.items.reduce((total, item) => total + item.quantity, 0), 0)}</Table.Th>
                        <Table.Th>{chosenStore && Math.round(chosenStore.reduce((total, sale) => total + sale.total, 0) * 100) / 100}</Table.Th>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </GraphWithStatCard>
    )
};
export default SalesView;