import React from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import {NativeSelect, Table} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import formatter from "../../../modules/utils/numberFormatter";
import Order from "../../../modules/classes/Order";
import useUsage from "../../../modules/hooks/useUsage";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {TableSort} from "../../../components/mantine/TableSort";

const storeNames = {
    "225004": "Big Commerce",
    "255895": "Ebay",
};


const DailyView = () => {
    useUsage("Ecommerce", "sales-range-table")
    const [[startDate, endDate], setDateRange] = React.useState([new Date(), new Date()])
    const [store, setStore] = React.useState("225004");
    let sales = useUpdates("/api/views/sales", {startDate, endDate});

    sales = sales.map(sale => new Order(sale));
    let results = [];
    sales
        .reduce((nameList, {orderId}) => {
            if (nameList.has(orderId)) {
                nameList.set(orderId, nameList.get(orderId) + 1);
            } else {
                nameList.set(orderId, 1);
            }
            return nameList
        }, new Map())
        .forEach((value, key) => {
            if (value > 1) {
                results.push(key);
            }
        })

    let storeIDs = [...new Set(sales.map(sale => sale.storeId))];
    let storeSales = {};
    storeIDs.forEach(storeId => {
        storeSales[storeId] = sales
            .filter(sale => sale.storeId === storeId)
            .filter(sale => sale.orderStatus === "shipped")
    });
    storeSales["All"] = sales;

    const chosenStore = storeSales[store];
    let itemRows = [...chosenStore?.reduce((acc, sale) => {
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
                acc.set(name, {
                    ...item,
                    ...{
                        total: Math.ceil(+item.quantity * +item.unitPrice * 100) / 100
                    }
                });
            }
        })
        return acc;
    }, new Map()).values() || []]


    return (
        <GraphWithStatCard
            title={"Daily Sales By Channel"}
            isLoading={sales.length === 0}
            noBorder
            dateInput={
                <CustomRangeMenu
                    subscribe={setDateRange}
                    defaultValue={[startDate, endDate]}
                    label={"Date Range"}
                    mb={"xl"}
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
                    {storeIDs.map((store, index) => <option value={`${store}`}
                                                            key={index}>{storeNames[store]}</option>)}
                    <option value={"All"}>All</option>
                </NativeSelect>
            }
            cards={[]}
        >
            {itemRows && <TableSort
                specialFormatting={[
                    {column: "total", fn:(value)=>formatter(value,"currency")},
                    {column: "sku", fn:String}
                ]}
                data={
                    itemRows?.map((row) => {
                        return {
                            sku: row.sku,
                            name: row.name,
                            quantity: row.quantity,
                            unitPrice: row.unitPrice,
                            total: row.total,
                        }
                    })
                }
                footer={
                    <Table.Tr>
                        <Table.Th>Total</Table.Th>
                        <Table.Th></Table.Th>
                        <Table.Th>{chosenStore && chosenStore.reduce((total, sale) => total + sale.items.reduce((total, item) => total + item.quantity, 0), 0)}</Table.Th>
                        <Table.Th> </Table.Th>
                        <Table.Th>{chosenStore && formatter(Math.round(chosenStore.reduce((total, sale) => +total + +sale.total ?? 0, 0) * 100) / 100, 'currency')}</Table.Th>
                    </Table.Tr>
                }
            />}
        </GraphWithStatCard>
    )
};
export default DailyView;