import React, {useEffect, useState} from 'react';
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";


import {MultiSelect, NativeSelect, useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../_app";

import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import makeDateArray from "../../../modules/utils/makeDateArray";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useOrders from "../../../modules/hooks/useOrders";
import useUpdates from "../../../modules/hooks/useUpdates";
import formatter from "../../../modules/utils/numberFormatter";
import {lastDayOfWeek} from "date-fns";
import {useDebouncedValue} from "@mantine/hooks";
import useEvents from "../../../modules/hooks/useEvents";
import StatCard from "../../../components/mantine/StatCard";
import smoothData from "../../../modules/utils/graphUtils/smoothData";
import colorizeLine from "../../../modules/utils/colorizeLine";


const storeNameMap = {
    "225004": "Big Commerce", "255895": "Ebay", "Total": "Total", "64872": "Manual Creation", "All": "All"
}
const storeDataMap = {
    "Big Commerce": ["225004"],
    "Ebay": ["255895"],
    "Manual Creation": ["64872"],
    "All": ["225004", "255895", "64872"],
    "Total": ["total"]
}


const WeeklyView = () => {
    useUsage("Ecommerce", "sales-weekly-chart")
    const [date, setDate] = useState(new Date());
    const theme = useMantineColorScheme();

    const [storeId, setStoreId] = useState("All");
    const salesTarget = useUpdates('/api/admin/salesTarget');
    const [affectedCategories, setAffectedCategories] = useState([]);


    let startDate = findStartOfWeek(date);
    let endDate = lastDayOfWeek(new Date(date));

    let { categories , reducedEvents} = useEvents({
        startDate,
        endDate,
        affected_categories:affectedCategories,
        timeScale:'week',
        excludedCategories:['Processing','Warehouse'],
        combined:false
    });
    useEffect(() => {
        if(affectedCategories.length > 0) return;
        setAffectedCategories(categories)
    }, [categories]);

    const orders = useOrders({
        startDate,
        endDate
    }, {
        acceptedConditions: ["1", "2", "3", "4"]
    });
    const useTheme = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;


    let week = makeDateArray(findStartOfWeek(date))
        .map(date => {
            let [yyyy, mm, dd] = date.split("-");
            return `${mm}/${dd}/${yyyy}`;
        })


    let storeIds = ['All', ...new Set(orders.map(order => order.storeId)), 'Total'];

    let weeklySales = {};

    week.forEach(day => {
        weeklySales[day] = {
            total: 0, orders: [],
        };
    })
    orders.forEach(order => {
        let day = order.paymentDate
        if (!weeklySales[day]) {
            return;
        }
        if (!weeklySales[day][order.storeId]) {
            weeklySales[day][order.storeId] = 0;
        }
        weeklySales[day].total += order.total;
        weeklySales[day].orders.push(order);
        weeklySales[day][order.storeId] += order.total;

    })


    const graphDataSets = storeDataMap[storeNameMap[storeId]]
        .map((sid, index) => {
            return {
                label: storeNameMap[sid],
                data: Object.keys(weeklySales)
                    .map(day => weeklySales[day] ?? undefined)
                    .filter(day => day !== undefined)
                    .map(day => Math.floor(day[sid] * 100) / 100 ?? 0).map(month => isNaN(month) ? 0 : month),
                backgroundColor: Object.values(colorScheme)[index],
                type: 'bar',
                stack:1,
            }
        })

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let {datasetIndex, dataIndex} = context;
                        let {label} = context.chart.data.datasets[datasetIndex];
                        let raw = context.raw;
                        return `${label}: $${raw}`;
                    }, footer: (context) => {
                        return "TOTAL: $" + context.reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }
            }, legend: {
                position: "top", align: "center", labels: {
                    boxWidth: 30, usePointStyle: true, color: useTheme(theme) + "A",
                },
            }, datalabels: {
                color: colorScheme.white, display: (context) => context.dataset.data[context.dataIndex] > 200, font: {
                    size: 11, weight: "bold",
                }, formatter: (value) => formatter(value, 'currency')
            }, annotation: {
                annotations: {
                    'salesTarget': {
                        type: 'line', borderColor: 'red', borderWidth: 2, label: {
                            display: true,
                            content: "Sales Target",
                            backgroundColor: 'red',
                            color: 'white',
                            rotation: 'auto'
                        }, value: () => salesTarget?.['daily'] ?? 0, scaleID: 'y',
                    }
                }
            }
        }, scales: {
            y: {
                ticks: {
                    callback: (value) => `${formatter(value, 'currency')}`,
                }, stacked: true,
            }, x: {
                stacked: true,
            }
        },
    }

    let dates = Object
        .keys(weeklySales)
        .map(date => new Date(date).toLocaleDateString());

    const data = {
        labels: dates,
        datasets: graphDataSets
    }



    return (
        <GraphWithStatCard
            title={"Weekly Sales"}
            dateInput={
                <DatePickerInput
                    mb={'md'}
                    label={"Year"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            slotOne={
                <MultiSelect
                    clearable
                    label={"Events Affected Categories"}
                    data={categories}
                    onChange={(e) => setAffectedCategories(e)}
                    value={affectedCategories}
                    mb={'md'}
                />
            }
            slotTwo={
                <NativeSelect
                    mb={"xl"}
                    label={"Store"}
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                >
                    {
                        storeIds.map((store, index) => <option
                        value={`${store}`}
                        key={index}> {storeNameMap[store]} </option>)
                    }
                </NativeSelect>
            }
            cards={[
                <StatCard
                    key={0}
                    stat={{
                        title: "Total",
                        value: Object.values(weeklySales).reduce((acc, cur) => acc + cur.total, 0),
                        subtitle: "Sales for the week"
                    }}
                />,
                <StatCard
                    key={1}
                    stat={{
                        title: "Average Sales",
                        value: Object.values(weeklySales).reduce((acc, cur) => acc + cur.total, 0) / dates.length,
                        subtitle: "Per Day"
                    }}
                />,
                <StatCard
                    key={2}
                    stat={{
                        title: "Big Commerce Total",
                        value: Object.values(weeklySales).reduce((acc, curr) => acc + Number(curr?.["225004"] ?? 0), 0),
                    }}
                />,
                <StatCard
                    key={3}
                    stat={{
                        title: "Ebay Total",
                        value: Object.values(weeklySales).reduce((acc, curr) => acc + Number(curr?.["255895"] ?? 0), 0),
                    }}
                />,

            ]}
        >
            <BaseChart
                stacked
                events={reducedEvents(dates)}
                data={data}
                config={options}
            />
        </GraphWithStatCard>);
};

export default WeeklyView;