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
import {setDate, setMonth} from "date-fns";
import StatCard from "../../../components/mantine/StatCard";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";

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
    useUsage("Ecommerce","sales-yearly-chart")
    const [date, setDate] = useState(setMonth(dateSet(new Date(),0),0));
    const theme = useMantineColorScheme();
    const [storeId, setStoreId] = useState("All");
    const sales = useUpdates("/api/views/sales",{date, interval:'1 year'});
    const useTheme = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const orders = sales.map(order => new Order(order));
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    let storeIds= [
        'All',
        ...new Set(orders.map(order => order.storeId)),
        'Total'
    ];
    let yearlySales = {};
    orders.forEach(order => {
        let month = months[+order.paymentDate.split("/")[0] - 1];
        if(!yearlySales[month]){
            yearlySales[month] = {
                total: 0,
                orders: [],
            }
        }
        if(!yearlySales[month][order.storeId]){
            yearlySales[month][order.storeId] = 0;
        }
        yearlySales[month].total += order.total;
        yearlySales[month].orders.push(order);

        yearlySales[month][order.storeId] += order.total;
    })

    yearlySales = months
        .map(month => yearlySales[month] ?? {total:0})
        .filter(month => month !== undefined)




    const graphDataSets = storeDataMap[storeNameMap[storeId]]
        .map((sid,index) => {
            return {
                label: storeNameMap[sid],
                data: yearlySales.map(month => Math.floor(month[sid] * 100) / 100 ?? 0).map(month => isNaN(month) ? 0 : month),
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
        labels:months,
        datasets : graphDataSets
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
                        value: yearlySales.reduce((acc, {total}) => (acc + +total), 0),
                        format:'currency'
                }}
            />,
            <StatCard
                key={1}
                stat={{
                    title: "Ebay Sales",
                    value: yearlySales.reduce((acc, curr) => acc + Number(curr?.["255895"] ?? 0), 0),
                    format:'currency'
                }}
                />,
            <StatCard
                key={2}
                stat={{
                    title: "Big Commerce Sales",
                    value: yearlySales.reduce((acc, curr) => acc + Number(curr?.["225004"] ?? 0), 0),
                    format:'currency'
                }}
            />,
            <StatCard
                key={3}
                stat={{
                    title: "Best Month Ebay",
                    value: yearlySales.reduce((acc, curr) => (acc > +curr["255895"] ? acc : +curr["255895"]), 0),
                    format:'currency',
                }}
            />,
            <StatCard
                key={4}
                stat={{
                    title: "Best Month Big Commerce",
                    value: yearlySales.reduce((acc, curr) => (acc > +curr["225004"] ? acc : +curr["225004"]), 0),
                    format:'currency',
                }}
            />
        ]}
        >
            <BaseChart stacked data={data} config={options}/>
        </GraphWithStatCard>
    );
};

export default YearlyView;