import React, {useState} from 'react';
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";
import useUpdates from "../../../modules/hooks/useUpdates";
import Order from "../../../modules/classes/Order";

import {NativeSelect, useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../_app";

import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import makeDateArray from "../../../modules/utils/makeDateArray";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";


const storeNameMap = {
    "225004": "Big Commerce",
    "255895": "Ebay",
    "Total": "Total",
    "64872": "Manual Creation",
    "All": "All"
}
const storeDataMap = {
    "Big Commerce": ["225004"],
    "Ebay": ["255895"],
    "Manual Creation": ["64872"],
    "All": ["225004","255895","64872"],
    "Total": ["total"]
}



const WeeklyView = () => {
    useUsage("Ecommerce","sales-weekly-chart")
    const [date, setDate] = useState(new Date());
    const theme = useMantineColorScheme();
    const [storeId, setStoreId] = useState("All");
    const sales = useUpdates("/api/views/sales",{date:findStartOfWeek(date), interval:'1 week'});
    const useTheme = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const orders = sales.map(order => new Order(order));

    let week = makeDateArray(findStartOfWeek(date))
        .map(date => {
            let [yyyy,mm,dd] = date.split("-");
            return `${mm}/${dd}/${yyyy}`;
        })


    let storeIds= [
        'All',
        ...new Set(orders.map(order => order.storeId)),
        'Total'
    ];
    let weeklySales = {};
    week.forEach(day => {
        weeklySales[day] = {
            total: 0,
            orders: [],
        };
    })
    orders.forEach(order => {
        let day = order.paymentDate
            if(!weeklySales[day]){
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
        .map((sid,index) => {
            return {
                label: storeNameMap[sid],
                data: Object.keys(weeklySales)
                    .map(day => weeklySales[day] ?? undefined)
                    .filter(day => day !== undefined)
                    .map(day => Math.floor(day[sid] * 100) / 100 ?? 0).map(month => isNaN(month) ? 0 : month),
                backgroundColor: Object.values(colorScheme)[index],
                type:'bar'
            }
        })


    const options = {
        plugins: {
            tooltip: {
                callbacks: {
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
                    weight: "bold",
                },
                formatter: Math.round
            },
        },
        scales: {
            y: {
                stacked: true,
            },
            x:{
                stacked: true,
            }
        },
    }
    const data ={
        labels:Object.keys(weeklySales),
        datasets : graphDataSets
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
        >
            <BaseChart stacked data={data} config={options}/>
        </GraphWithStatCard>
    );
};

export default WeeklyView;