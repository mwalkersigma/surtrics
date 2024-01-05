import React from 'react';
import { Title, Text, Paper, Group, Progress, Tooltip} from "@mantine/core";
import formatter from "../../../modules/utils/numberFormatter";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {TableSort} from "../../../components/mantine/TableSort";
import useOrders from "../../../modules/hooks/useOrders";
import useUsage from "../../../modules/hooks/useUsage";


function SectionBar({sectionTitle,size=30, temp,field,format, subtitle}) {
    let totalForField = Object.values(temp).reduce((acc, item) => {
        acc += item[field];
        return acc;
    }, 0);
    return (
        <Paper withBorder p={'2% 2%'}  >
            <Text mb={'md'}>{sectionTitle}</Text>
            <Title mb={'md'}>{formatter(totalForField,format)}</Title>
            <Progress.Root size={size} mb={'md'}>
                {temp?.[1]?.[field+"Percent"] > 0 && (
                    <Tooltip label={`Condition New in Box : ${formatter(temp?.[1]?.[field],format)} (${formatter(temp?.[1]?.[field+"Percent"] ?? 0,'percent')}) `}>
                        <Progress.Section value={temp?.[1]?.[field+"Percent"] * 100 ?? 0} color="cyan">
                            <Progress.Label>1</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {temp?.[2]?.[field+"Percent"] > 0 && (
                    <Tooltip label={`Condition New in Sigma Packaging : ${formatter(temp?.[2]?.[field],format)} (${formatter(temp?.[2]?.[field+"Percent"] ?? 0,'percent')}) `}>
                        <Progress.Section value={temp?.[2]?.[field+"Percent"] * 100 ?? 0} color="pink">
                            <Progress.Label>2</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {temp?.[3]?.[field+"Percent"] > 0 && (
                    <Tooltip label={`Condition Refurbished : ${formatter(temp?.[3]?.[field],format)} (${formatter(temp?.[3]?.[field+"Percent"] ?? 0,'percent')}) `}>
                        <Progress.Section value={temp?.[3]?.[field+"Percent"] * 100 ?? 0} color="orange">
                            <Progress.Label>3</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {temp?.[4]?.[field+"Percent"] > 0 && (
                    <Tooltip label={`Condition Used : ${formatter(temp?.[4]?.[field],format)} (${formatter(temp?.[4]?.[field+"Percent"] ?? 0,'percent')}) `}>
                        <Progress.Section value={temp?.[4]?.[field+"Percent"] * 100 ?? 0} color="blue">
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






const SalesByCondition = () => {
    useUsage("Ecommerce","sales-Range-byCondition")
    const [[startDate, endDate], setDates] = React.useState([new Date("2023/12/01"), new Date("2023/12/31")]);

    const orders = useOrders({startDate, endDate},{acceptedConditions: ["1", "2", "3", "4"]});

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
        </GraphWithStatCard>
    );
};

export default SalesByCondition;