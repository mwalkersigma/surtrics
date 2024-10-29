import React from 'react';
import {Divider, Group, Paper, Progress, SimpleGrid, Space, Text, Title, Tooltip} from "@mantine/core";
import formatter from "../../../modules/utils/numberFormatter";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {TableSort} from "../../../components/mantine/TableSort";
import useOrders from "../../../modules/hooks/useOrders";
import useUsage from "../../../modules/hooks/useUsage";
import useUpdates from "../../../modules/hooks/useUpdates";


function SectionBar({sectionTitle, size = 30, temp, field, format, subtitle}) {
    let totalForField = Object.values(temp).reduce((acc, item) => {
        acc += item[field];
        return acc;
    }, 0);
    return (
        <Paper withBorder p={'2% 2%'}>
            <Text mb={'md'}>{sectionTitle}</Text>
            <Title mb={'md'}>{formatter(totalForField, format)}</Title>
            <Progress.Root size={size} mb={'md'}>
                {temp?.[1]?.[field + "Percent"] > 0 && (
                    <Tooltip
                        label={`Condition New in Box : ${formatter(temp?.[1]?.[field], format)} (${formatter(temp?.[1]?.[field + "Percent"] ?? 0, 'percent')}) `}>
                        <Progress.Section value={temp?.[1]?.[field + "Percent"] * 100 ?? 0} color="cyan">
                            <Progress.Label>1</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {temp?.[2]?.[field + "Percent"] > 0 && (
                    <Tooltip
                        label={`Condition New in Sigma Packaging : ${formatter(temp?.[2]?.[field], format)} (${formatter(temp?.[2]?.[field + "Percent"] ?? 0, 'percent')}) `}>
                        <Progress.Section value={temp?.[2]?.[field + "Percent"] * 100 ?? 0} color="pink">
                            <Progress.Label>2</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {temp?.[3]?.[field + "Percent"] > 0 && (
                    <Tooltip
                        label={`Condition Refurbished : ${formatter(temp?.[3]?.[field], format)} (${formatter(temp?.[3]?.[field + "Percent"] ?? 0, 'percent')}) `}>
                        <Progress.Section value={temp?.[3]?.[field + "Percent"] * 100 ?? 0} color="orange">
                            <Progress.Label>3</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {temp?.[4]?.[field + "Percent"] > 0 && (
                    <Tooltip
                        label={`Condition Used : ${formatter(temp?.[4]?.[field], format)} (${formatter(temp?.[4]?.[field + "Percent"] ?? 0, 'percent')}) `}>
                        <Progress.Section value={temp?.[4]?.[field + "Percent"] * 100 ?? 0} color="blue">
                            <Progress.Label>4</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
            </Progress.Root>
            <Text c={'dimmed'} fz={'xs'}>
                {subtitle}
            </Text>
        </Paper>
    );
}


const InventoryCondition = () => {
    const inventory = useUpdates("/api/views/inventory/inventory");


    const conditions = {}

    inventory.forEach(item => {
        let skuClass = item.sku.split("-")[1];
        if (!conditions[`${skuClass}`]) {
            conditions[`${skuClass}`] = {
                quantity: 0,
                value: 0,
                cost: 0,
                count: 0
            }
        }
        if (isNaN(Number(item['quantity'])) || isNaN(Number(item['retail_price'])) || isNaN(Number(item['cost']))) {
            console.log(item)
            return
        }
        conditions[Number(skuClass)].quantity += isNaN(Number(item['quantity'])) ? 0 : Number(item['quantity']);
        conditions[Number(skuClass)].value += isNaN(Number(item['retail_price'])) ? 0 : Number(item['retail_price']);
        conditions[Number(skuClass)].cost += isNaN(Number(item['cost'])) ? 0 : Number(item['cost']);
        conditions[Number(skuClass)].count = conditions[`${skuClass}`].count ? conditions[`${skuClass}`].count + 1 : 1;
    })

    let totals = Object.values(conditions).reduce((acc, item) => {
        acc.cost += Number(item.cost);
        acc.value += Number(item.value);
        acc.count += Number(item.count);
        acc.quantity += Number(item.quantity);
        return acc;
    }, {count: 0, quantity: 0, cost: 0, value: 0})


    Object.entries(conditions).forEach(([, value]) => {
        value.countPercent = +(value.count / totals.count);
        value.quantityPercent = +(value.quantity / totals.quantity);
        value.costPercent = +(value.cost / totals.cost);
        value.valuePercent = +(value.value / totals.value);
    });


    return (
        <>
            <Title ta={"center"} order={1} mt={"xl"} mb={"xl"}> Inventory </Title>
            <Text c={'red'} fz={'xs'} my={'sm'}>
                This data is for new SKUs only (SKUs with a dash in them). This data is not representative of all sales.
            </Text>
            <SimpleGrid cols={2} spacing={'md'} mb={"xl"} >
                <SectionBar
                    sectionTitle={"Quantity"}
                    temp={conditions}
                    field={"quantity"}
                    format={"number"}
                    subtitle={'This is the total number of items in inventory.'}
                />

                <SectionBar
                    sectionTitle={"Value"}
                    temp={conditions}
                    field={"value"}
                    format={"currency"}
                    subtitle={'This is the total value of the items in inventory. (retail price)'}
                />

                <SectionBar
                    sectionTitle={"Cost"}
                    temp={conditions}
                    field={"cost"}
                    format={"currency"}
                    subtitle={'This is the total cost of the items in inventory. We do not have complete costs for all items.'}
                />

                <SectionBar
                    sectionTitle={"Count"}
                    temp={conditions}
                    field={"count"}
                    format={"number"}
                    subtitle={'This is the number of unique SKUs in inventory.'}
                />
            </SimpleGrid>

            <TableSort
                mb={"xl"}
                noSearch
                specialFormatting={[
                    {column: "value percent", fn: (value) => formatter(value, "percent")},
                    {column: "count percent", fn: (value) => formatter(value, "percent")},
                    {column: "quantity percent", fn: (value) => formatter(value, "percent")},
                    {column: "cost percent", fn: (value) => formatter(value, "percent")},
                    {column: "value", fn: (value) => formatter(value, "currency")},
                    {column: "cost", fn: (value) => formatter(value, "currency")},
                    {column: "quantity", fn: (value) => formatter(value, "number")}
                ]}
                data={Object.entries(conditions).map(([key, value]) => {
                    return {
                        condition: `-${key}`,
                        "sku count": value.count,
                        value: value.value,
                        cost: value.cost,
                        quantity: value.quantity,
                           "value percent": value.valuePercent,
                           "count percent": value.countPercent,
                        "quantity percent": value.quantityPercent,
                            "cost percent": value.costPercent,
                    }
                })}

                title={"Sales by Condition"}
            />

            <Space mt={"xl"} mb={"xl"} />
        </>
    )

}

const SalesByCondition = () => {
    useUsage("Ecommerce", "sales-Range-byCondition")
    const [[startDate, endDate], setDates] = React.useState([
        new Date("2023/12/01"),
        new Date("2023/12/31")
    ]);

    const orders = useOrders({
        startDate,
        endDate
    }, {
        acceptedConditions: ["1", "2", "3", "4"]
    });

    const salesWithNewSkus = orders
        .map(order => order.items)
        .flat()
        .filter(item => String(item.sku)?.includes("-"))

    const salesByCondition = salesWithNewSkus
        .reduce((acc, item) => {
            let condition = item.sku.split("-")[1];
            if (!acc[condition]) {
                acc[condition] = {
                    revenue: 0,
                    count: new Set(),
                    quantity: 0
                };
            }
            acc[condition].revenue += Number(item.unitPrice) * Number(item.quantity);
            acc[condition].count.add(item.sku);
            acc[condition].quantity += Number(item.quantity);
            return acc
        }, {})

    Object.entries(salesByCondition).forEach(([, value]) => {
        value.count = value.count.size;
    })

    let totals = Object.values(salesByCondition).reduce((acc, item) => {
        acc.revenue += Number(item.revenue);
        acc.count += Number(item.count);
        acc.quantity += Number(item.quantity);
        return acc;
    }, {revenue: 0, count: 0, quantity: 0})

    let temp = JSON.parse(JSON.stringify(salesByCondition))

    Object.entries(temp).forEach(([, value]) => {
        value.revenuePercent = +(value.revenue / totals.revenue);
        value.countPercent = +(value.count / totals.count);
        value.quantityPercent = +(value.quantity / totals.quantity);
    });


    return (
        <GraphWithStatCard
            noBorder
            title={"Sales by Condition"}
            dateInput={
                <CustomRangeMenu
                    label={"Date Range"}
                    subscribe={setDates}
                    defaultValue={[startDate, endDate]}
                />
            }
        >
            <Text c={'red'} fz={'xs'} my={'sm'}>
                This data is for new SKUs only (SKUs with a dash in them). This data is not representative of all sales.
            </Text>
            <Group mb={'xl'} grow>
                <SectionBar
                    sectionTitle={"Revenue"}
                    temp={temp}
                    field={"revenue"}
                    format={"currency"}
                    subtitle={'This is the unit price multiplied by the quantity sold.'}
                />
                <SectionBar
                    sectionTitle={"Count"}
                    temp={temp}
                    field={"count"}
                    subtitle={'This is the number of unique SKUs sold.'}
                />
                <SectionBar
                    sectionTitle={"Quantity"}
                    temp={temp}
                    field={"quantity"}
                    subtitle={'This is the total number of items sold.'}
                />
            </Group>
            <TableSort
                noSearch
                specialFormatting={[
                    {column: "revenuePercent", fn: (value) => formatter(value, "percent")},
                    {column: "countPercent", fn: (value) => formatter(value, "percent")},
                    {column: "quantityPercent", fn: (value) => formatter(value, "percent")},
                    {column: "revenue", fn: (value) => formatter(value, "currency")}
                ]}
                data={Object.entries(temp).map(([key, value]) => {
                    return {
                        condition: `-${key}`,
                        revenue: value.revenue,
                        count: value.count,
                        quantity: value.quantity,
                        revenuePercent: value.revenuePercent,
                        countPercent: value.countPercent,
                        quantityPercent: value.quantityPercent,
                    }
                })}

                title={"Sales by Condition"}
            />

            <Divider mt={"xl"} variant={"dashed"} />

            <InventoryCondition/>

        </GraphWithStatCard>
    );
};

export default SalesByCondition;