import React, {useEffect, useState} from 'react';
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
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
import {colorScheme} from "../../_app";
import {getMonth, lastDayOfYear, setDate, setMonth} from "date-fns";
import StatCard from "../../../components/mantine/StatCard";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useEvents from "../../../modules/hooks/useEvents";
import useOrders from "../../../modules/hooks/useOrders";
import useUpdates from "../../../modules/hooks/useUpdates";
import formatter from "../../../modules/utils/numberFormatter";


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
    "225004": "Big Commerce",
    "255895": "Ebay",
    "Total": "Total",
    "total": "Total",
    "64872": "Manual Creation",
    "All": "All"
}
//225004
const storeDataMap = {
    "Big Commerce": ["225004"],
    "Ebay": ["255895"],
    "Manual Creation": ["64872"],
    "All": ["225004","255895","64872"],
    "Total": ["total"]
}

const dateSet = setDate
const YearlyView = () => {
    useUsage("Ecommerce","sales-yearly-chart");
    const [date, setDate] = useState(setMonth(dateSet(new Date(),1),0));
    const [affectedCategories, setAffectedCategories] = useState([]);
    const theme = useMantineColorScheme();
    const salesTarget = useUpdates('/api/admin/salesTarget');

    const themeColor = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const [storeId, setStoreId] = useState("Total");
    const orders = useOrders({startDate:date, endDate:lastDayOfYear(date)},{acceptedConditions: ["1", "2", "3", "4"]});
    let {categories , reducedEvents} = useEvents({
        startDate:date,
        endDate:lastDayOfYear(date),
        affected_categories:affectedCategories,
        timeScale:'month',
        excludedCategories:['Processing','Warehouse'],
        combined:false
    });
    useEffect(() => {
        if(affectedCategories.length > 0) return;
        setAffectedCategories(categories)
    }, [categories]);


    let ordersTotal = orders.reduce((acc, order) => {
        return acc + order.total;
    },0);

    const displayMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    let storeIds= [
        'All',
        ...new Set(orders.map(order => order.storeId)),
        'Total'
    ];

    let yearSales = {total:0};
    let orderCount = {total:0};

    orders.forEach(order=>{
        let month = getMonth(new Date(order.paymentDate));

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

    })

    let dataForGraph = []

    for (let i = 0 ; i < displayMonths.length; i++) {

        let dataSet = storeDataMap[storeNameMap[storeId]];

        dataSet.forEach(store => {
            let displayName = displayMonths[i];

            let monthSales = yearSales[i]?.[store]?.total ?? yearSales[i]?.[store] ?? 0;
            let monthValue = Math.round( monthSales * 100 ) / 100;
            dataForGraph.push({
                displayName,
                monthValue,
                store:store,
                index:i
            });
        })
    }

    const data = {
        labels:displayMonths,
        datasets:storeDataMap[storeNameMap[storeId]].map((dataSet,index) => {
            return {
                label:storeNameMap[dataSet],
                data:dataForGraph.filter(ele => ele.store === dataSet).map(({monthValue})=>monthValue),
                backgroundColor: colorScheme.byIndex(index),
                type:'bar'
            }
        })
    }

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
                        value: () => salesTarget?.['monthly'] ?? 0,
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

    let dates = [...new Set(dataForGraph.map(({displayName})=>{
        let year = new Date(date).getFullYear();
        let month = displayMonths.indexOf(displayName);
        let day = 1;
        return new Date(year,month,day);
    }))]

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
        slotTwo={
            <MultiSelect
                clearable
                label={"Events Affected Categories"}
                data={categories}
                onChange={(e) => setAffectedCategories(e)}
                value={affectedCategories}
                mb={'md'}
            />
        }
        slotOne={
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
                events={reducedEvents(dates || [])}
                stacked
                data={data}
                config={options}
            />
        </GraphWithStatCard>
    );
};

export default YearlyView;
