import React, {useEffect, useState} from 'react';
import GraphWithStatCard from "../../../../components/mantine/graphWithStatCard";
import {YearPickerInput} from "@mantine/dates";

import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {MultiSelect, NativeSelect, useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../../_app";
import {lastDayOfYear, setDate, setMonth, startOfMonth} from "date-fns";
import StatCard from "../../../../components/mantine/StatCard";
import useUsage from "../../../../modules/hooks/useUsage";
import BaseChart from "../../../../components/Chart";
import useEvents from "../../../../modules/hooks/useEvents";
import useOrders from "../../../../modules/hooks/useOrders";
import useUpdates from "../../../../modules/hooks/useUpdates";
import formatter from "../../../../modules/utils/numberFormatter";
import smoothData from "../../../../modules/utils/graphUtils/smoothData";
import colorizeLine from "../../../../modules/utils/colorizeLine";
import {storeNames} from "../../../../modules/constants";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    LineElement,
    DataLabels,
    PointElement,
);

const storeNameMap = {
    ...storeNames,
    "Total": "Total",
    "total": "Total",
    "64872": "Manual Creation",
    "All": "All"
}
//225004
const storeDataMap = {
    "Big Commerce": ["225004"],
    "Ebay": ["255895"],
    "Amazon": ["260637"],
    "Manual Creation": ["64872"],
    "All": ["225004","255895","64872","260637"],
    "Total": ["total"]
}

const dateSet = setDate
const Index = () => {
    useUsage("Ecommerce","sales-yearly-chart");
    const [date, setDate] = useState(setMonth(dateSet(new Date(),1),0));
    const [affectedCategories, setAffectedCategories] = useState([]);
    const theme = useMantineColorScheme();
    const salesTarget = useUpdates('/api/admin/salesTarget');

    const themeColor = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const [storeId, setStoreId] = useState("Total");
    const orders = useOrders(
        {
            startDate:date,
            endDate:lastDayOfYear(date)
        },
        {
            acceptedConditions: ["1", "2", "3", "4"]
        });
    let {categories , reducedEvents} = useEvents({
        startDate:date,
        endDate:lastDayOfYear(date),
        affected_categories:affectedCategories,
        timeScale:'month',
        excludedCategories:[
            'Processing',
            'Warehouse'
        ],
    });
    useEffect(() => {
        if(affectedCategories.length > 0) return;
        setAffectedCategories(categories)
    }, [categories]);


    let ordersTotal = orders.reduce((acc, order) => {
        return acc + order.total;
    },0);


    let storeIds= [
        'All',
        ...new Set(orders.map(order => order.storeId)),
        'Total'
    ];

    let yearSales = {total:0};
    let orderCount = {total:0};

    orders.forEach(order=>{
        if (new Date(order.paymentDate).getFullYear() !== date.getFullYear()) return;
        let month = startOfMonth(new Date(order.paymentDate)).toLocaleDateString();

        if(!yearSales[month]){
            yearSales[month] = {
                total:0
            }
        }
        let orderTotal = order.total;
        yearSales.total += Number(orderTotal);
        yearSales[month].total += Number(orderTotal);

        let store = order.storeId;
        if(!yearSales[month][store]){
            yearSales[month][store] = {total:0}
        }
        yearSales[month][store].total += Number(orderTotal);

        orderCount.total += 1;

        if(!orderCount[month]){
            orderCount[month] = 0;
        }

        orderCount[month] += 1;

    });




    let dataForGraph = []

    let months = Object.keys(yearSales).filter(date => date !== 'total')

    for (let i = 0 ; i < months.length; i++) {

        let dataSet = storeDataMap[storeNameMap[storeId]];
        let month = months[i];
        dataSet.forEach(store => {
            let monthSales = yearSales[month]?.[store]?.total ?? yearSales[month]?.[store] ?? 0;
            let monthValue = Math.round( monthSales * 100 ) / 100;
            dataForGraph.push({
                monthValue,
                store:store,
                index:i
            });
        })

    }


    const data = {
        labels:months,
        datasets:storeDataMap[storeNameMap[storeId]].map((dataSet,index) => {
            return {
                label:storeNameMap[dataSet],
                data:dataForGraph.filter(ele => ele.store === dataSet).map(({monthValue})=>monthValue),
                backgroundColor: colorScheme.byIndex(index),
                type:'bar'
            }
        })
    }
    const value = salesTarget?.['monthly'] ?? 0 ;


    const options = {
        plugins: {
            tooltip: {
                enabled:false,
            },
            legend: {
                position: "top",
                align: "center",
                labels: {
                    boxWidth: 30,
                    usePointStyle: true,
                    color: themeColor(theme)+"A",
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
                annotations: [
                    {
                        value,
                        type: 'line',
                        borderColor: 'red',
                        borderWidth: 2,
                        label: {
                            display: true,
                            content: "Sales Target",
                            backgroundColor: 'red',
                            color: 'white',
                            rotation: 'auto'
                        },
                        scaleID: 'y',
                    }
                ]
            }
        },
        scales: {
            y: {
                ticks: {
                    callback:(value)=> `${formatter(value,'currency')}`,
                },
                stacked: true,
                min:0,
                max:salesTarget?.['monthly'] * 1.3 ?? 0,
            },
            x:{
                stacked: true,
            }
        },
    };

    let dataForTrend = months.map(month => yearSales[month]?.total ?? 0);
    data.datasets.push({
        label: "Trend",
        data: smoothData(dataForTrend, 8),
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
        title={"Yearly Sales"}
        dateInput={
            <YearPickerInput
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
                    title: "Total Sales",
                    value: ordersTotal,
                    format:'currency'
                }}
            />,
            <StatCard
                key={1}
                stat={{
                    title: "Total Orders",
                    value: orderCount.total,
                    format:'number'
                }}
            />,
            <StatCard
                key={2}
                stat={{
                    title:"Big Commerce Total",
                    value:Object.values(yearSales).reduce((acc, curr) => acc + Number(curr?.["225004"]?.total ?? 0), 0),
                    format:'currency'
                }}
            />,
            <StatCard
                key={3}
                stat={{
                    title:"Ebay Total",
                    value:Object.values(yearSales).reduce((acc, curr) => acc + Number(curr?.["255895"]?.total ?? 0), 0),
                    format:'currency'
                }}
            />
        ]}
        >
            <BaseChart
                events={reducedEvents(months)}
                stacked
                data={data}
                config={options}
            />
        </GraphWithStatCard>
    );
};

export default Index;
