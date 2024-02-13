import React, {useEffect, useState} from 'react';
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {MonthPickerInput} from "@mantine/dates";


import {MultiSelect, NativeSelect, useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../_app";

import {lastDayOfMonth, setDate} from "date-fns";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useOrders from "../../../modules/hooks/useOrders";
import useUpdates from "../../../modules/hooks/useUpdates";
import formatter from "../../../modules/utils/numberFormatter";
import useEvents from "../../../modules/hooks/useEvents";
import StatCard from "../../../components/mantine/StatCard";
import smoothData from "../../../modules/utils/graphUtils/smoothData";
import colorizeLine from "../../../modules/utils/colorizeLine";


const storeNameMap = {
    "225004": "Big Commerce",
    "255895": "Ebay",
    "Total": "Total",
    "64872": "Manual Creation",
    "All": "All"
}
const storeDataMap = {
    "Big Commerce": [
        "225004"
    ],
    "Ebay": [
        "255895"
    ],
    "Manual Creation": [
        "64872"
    ],
    "All": [
        "225004",
        "255895",
        "64872"
    ],
    "Total": [
        "total"
    ]
}

const dateSet = setDate
const MonthlyView = () => {
    useUsage("Ecommerce","sales-monthly-chart")
    const [date, setDate] = useState(dateSet(new Date(),1));
    const theme = useMantineColorScheme();
    const [storeId, setStoreId] = useState("All");
    const orders = useOrders({startDate: date, endDate: lastDayOfMonth(date)},{acceptedConditions: ["1", "2", "3", "4"]});
    const useTheme = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const salesTarget = useUpdates('/api/admin/salesTarget');

    const [affectedCategories, setAffectedCategories] = useState([]);
    let { categories , reducedEvents} = useEvents({
        startDate:date,
        endDate:lastDayOfMonth(date),
        affected_categories:affectedCategories,
        timeScale:'week',
        excludedCategories:['Processing','Warehouse'],
        combined:false
    });




    useEffect(() => {
        if(affectedCategories.length > 0) return;
        setAffectedCategories(categories)
    }, [categories]);

    let storeIds= [
        'All',
        ...new Set(orders.map(order => order.storeId)),
        'Total'
    ];

    let monthlySales = {};

    orders.forEach(order => {
        let day = order.paymentDate;
        let orderTotal = Number(order.total);
        if(!monthlySales[day]){
            monthlySales[day] = {
                total: 0,
                orders: [],
            }
        }
        if(!monthlySales[day][order.storeId]){
            monthlySales[day][order.storeId] = 0;
        }
        monthlySales[day].total += orderTotal;
        monthlySales[day].orders.push(order);

        monthlySales[day][order.storeId] += orderTotal;
    })

    let dates = Object.keys(monthlySales);

    monthlySales = Object.keys(monthlySales)
        .map(month => monthlySales[month] ?? undefined)
        .filter(month => month !== undefined)


    const graphDataSets = storeDataMap[storeNameMap[storeId]]
        .map((sid,index) => {
            return {
                label: storeNameMap[sid],
                data: monthlySales.map(month => Math.floor(month[sid] * 100) / 100 ?? 0).map(month => isNaN(month) ? 0 : month),
                backgroundColor: colorScheme.byIndex(index),
                borderColor: colorScheme.byIndex(index),
                type:'line'
            }
        })

    const dataForTrendLine = Object.values(monthlySales).map(month => month.total);
    console.log(dataForTrendLine)



    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let {datasetIndex} = context;
                        let {label} = context.chart.data.datasets[datasetIndex];
                        let raw = context.raw;
                        return `${label}: $${raw}`;
                    },
                    footer: (context)=> {
                        return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }
            },
            legend: {
                position: "top",
                align: "center",
                labels: {
                    boxWidth: 30,
                    usePointStyle: true,
                    color: useTheme(theme)+"A",
                },
            },
            datalabels: {
                color: colorScheme.white,
                display: (context) => context.dataset.data[context.dataIndex] > 200,
                font: {
                    size: 11,
                    weight: "bold",
                },
                formatter: (value) => formatter(value,'currency')
            },
            annotation: {
                annotations: {
                    'salesTarget': {
                        type: 'line',
                        borderColor: 'red',
                        borderWidth: 2,
                        label:{
                            display:true,
                            content: "Sales Target",
                            backgroundColor: 'red',
                            color: 'white',
                            rotation: 'auto'
                        },
                        value: ()=> salesTarget?.['daily'] ?? 0,
                        scaleID: 'y',
                    }
                }
            }
        },
        scales:{
            y:{
                ticks: {
                    callback:(value)=> `${formatter(value,'currency')}`,
                },
            },
            x:{
                ticks: {
                    callback:(value)=> `${value + 1}`,
                }
            }
        }
    }

    const data ={
        labels:dates,
        datasets : graphDataSets
    }
    data.datasets.push({
        label: "Trend",
        data: smoothData(dataForTrendLine, 8),
        fill: false,
        segment: {
            borderColor: colorizeLine() ,
            backgroundColor: colorizeLine(),
        },
        radius: 0,
        type: "line",
        tension: 0.4,
        stack: 2,
        datalabels: {
            display: false
        },
    })
    return (
        <GraphWithStatCard
            title={"Monthly Sales"}
            dateInput={
                <MonthPickerInput
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
                    {storeIds.map((store, index) => <option value={`${store}`} key={index}>{storeNameMap[store]}</option>)}
                </NativeSelect>
            }
            cards={[
                <StatCard
                    key={0}
                    stat={{
                        title: "Total",
                        value: Object.values(monthlySales).reduce((acc, cur) => acc + cur.total, 0),
                        subtitle: "Sales for the month"
                    }}
                />,
                <StatCard
                    key={1}
                    stat={{
                        title: "Average Sales",
                        value: Object.values(monthlySales).reduce((acc, cur) => acc + cur.total, 0) / dates.length,
                        subtitle: "Per Day"
                    }}
                />,
                <StatCard
                    key={2}
                    stat={{
                        title: "Big Commerce Total",
                        value: Object.values(monthlySales).reduce((acc, curr) => acc + Number(curr?.["225004"] ?? 0), 0),
                    }}
                />,
                <StatCard
                    key={3}
                    stat={{
                        title: "Ebay Total",
                        value: Object.values(monthlySales).reduce((acc, curr) => acc + Number(curr?.["255895"] ?? 0), 0),
                    }}
                />,
            ]}
        >
            <BaseChart events={reducedEvents(dates)} stacked data={data} config={options}/>
        </GraphWithStatCard>
    );
};

export default MonthlyView;