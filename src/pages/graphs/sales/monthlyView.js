import React, {useState} from 'react';
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {MonthPickerInput} from "@mantine/dates";
import useUpdates from "../../../modules/hooks/useUpdates";
import Order from "../../../modules/classes/Order";

import {NativeSelect, useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../_app";

import {setDate} from "date-fns";
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

const dateSet = setDate
const MonthlyView = () => {
    useUsage("Ecommerce","sales-monthly-chart")
    const [date, setDate] = useState(dateSet(new Date(),1));
    const theme = useMantineColorScheme();
    const [storeId, setStoreId] = useState("All");
    const sales = useUpdates("/api/views/sales",{date, interval:'1 month'});
    const useTheme = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const orders = sales.map(order => new Order(order));
    let storeIds= [
        'All',
        ...new Set(orders.map(order => order.storeId)),
        'Total'
    ];
    let monthlySales = {};
    orders.forEach(order => {
        let day = +order.paymentDate.split("/")[1];
        if(!monthlySales[day]){
            monthlySales[day] = {
                total: 0,
                orders: [],
            }
        }
        if(!monthlySales[day][order.storeId]){
            monthlySales[day][order.storeId] = 0;
        }
        monthlySales[day].total += order.total;
        monthlySales[day].orders.push(order);

        monthlySales[day][order.storeId] += order.total;
    })
    monthlySales = Object.keys(monthlySales)
        .map(month => monthlySales[month] ?? undefined)
        .filter(month => month !== undefined)




    const graphDataSets = storeDataMap[storeNameMap[storeId]]
        .map((sid,index) => {
            return {
                label: storeNameMap[sid],
                data: monthlySales.map(month => Math.floor(month[sid] * 100) / 100 ?? 0).map(month => isNaN(month) ? 0 : month),
                backgroundColor: Object.values(colorScheme)[index],
                borderColor: Object.values(colorScheme)[index],
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