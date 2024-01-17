import React, {useState} from 'react';
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {MonthPickerInput} from "@mantine/dates";


import {NativeSelect, useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../_app";

import {getDate, lastDayOfMonth, setDate} from "date-fns";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useOrders from "../../../modules/hooks/useOrders";
import useUpdates from "../../../modules/hooks/useUpdates";


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

const dateSet = setDate
const MonthlyView = () => {
    useUsage("Ecommerce","sales-monthly-chart")
    const [date, setDate] = useState(dateSet(new Date(),1));
    const theme = useMantineColorScheme();
    const [storeId, setStoreId] = useState("All");
    const orders = useOrders({startDate: date, endDate: lastDayOfMonth(date)},{acceptedConditions: ["1", "2", "3", "4"]});
    const useTheme = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const salesTarget = useUpdates('/api/admin/salesTarget');

    let storeIds= [
        'All',
        ...new Set(orders.map(order => order.storeId)),
        'Total'
    ];

    let monthlySales = {};
    orders.forEach(order => {
        //let day = +order.paymentDate.split("/")[1];
        let day = getDate(new Date(order.paymentDate));
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
    }
    const data ={
        labels:Object.keys(monthlySales),
        datasets : graphDataSets
    }
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

export default MonthlyView;