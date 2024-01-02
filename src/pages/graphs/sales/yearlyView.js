import React, {useState} from 'react';
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {YearPickerInput} from "@mantine/dates";
import useUpdates from "../../../modules/hooks/useUpdates";
import Order from "../../../modules/classes/Order";
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
import {NativeSelect, useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../_app";
import {Chart} from "react-chartjs-2";
import {getMonth, lastDayOfYear, setDate, setMonth} from "date-fns";
import StatCard from "../../../components/mantine/StatCard";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
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
    const theme = useMantineColorScheme();
    const themeColor = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const [storeId, setStoreId] = useState("Total");
    const sales = useUpdates("/api/views/sales",{startDate:date, endDate:lastDayOfYear(date)});
    const orders = sales.map(sale => new Order(sale));


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
                callbacks: {
                    footer: (context)=> {
                        return "TOTAL: " + formatter(context.reduce((acc, {raw}) => (acc + +raw), 0),'currency');
                    }
                }
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
                    weight: "bold",
                },
                formatter: Math.round
            },
        },
        scales: {
            y: {
                stacked: true,
                min:0,
                max:1000000
            },
            x:{
                stacked: true,
            }
        },
    }

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
            <BaseChart stacked data={data} config={options} />
        </GraphWithStatCard>
    );
};

export default YearlyView;
