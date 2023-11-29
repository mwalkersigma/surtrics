import React, {useState} from 'react';

import useUpdates from "../../../modules/hooks/useUpdates";
import {Chart} from "react-chartjs-2";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {colorScheme} from "../../_app";
import {getMonth, setDate, setMonth} from "date-fns";
import {useMantineColorScheme} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {YearPickerInput} from "@mantine/dates";
import StatCard from "../../../components/mantine/StatCard";

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






function YearlyChart(props){
    let {yearData,theme} = props;
    const useTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 4,
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
        interaction:{
          intersect: false,
          mode: "index"
        },
        scales: {
            y: {
                stacked: true,
                min: 0,
                ticks: {
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            },
            x:{
                stacked: true,
                ticks: {
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            }
        },
    }

    const months = [ "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


    yearData =  yearData
        .map((item)=>({...item, ...{date_of_transaction: item.date_of_transaction.split("T")[0]}}))
        .sort((a,b)=> new Date(a.date_of_transaction) - new Date(b.date_of_transaction));

    const data = yearData.length > 0 && {
        labels: months,
        datasets: [
            {
                type: "bar",
                label: "New Inbound",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add on Receiving").map(({count}) => (+count)),
                backgroundColor: colorScheme.red,
                borderRadius: 5,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Incrementation",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add").map(({count}) => (+count)),
                backgroundColor: colorScheme.green,
                borderRadius: 5,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Relisting",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Relisting").map(({count}) => (+count)),
                backgroundColor: colorScheme.blue,
                borderRadius: 5,
                stack: "stack0"
            }
        ]
    };
    return <Chart data={data} type={"bar"} height={150} options={options}/>
}



let dateSet = setDate
function YearlyView() {
    const [date,setDate] = useState(dateSet(setMonth(new Date(),0),1));
    let yearData = useUpdates("/api/views/increments",{date,interval:"1 year",increment:"month"});
    const {colorScheme:theme} = useMantineColorScheme();


    const cardData = Object.values(yearData.reduce((acc, {count,date_of_transaction,transaction_reason}) =>{
        if(!acc[date_of_transaction]){
            acc[date_of_transaction]={count:0,date_of_transaction,[transaction_reason]:count};
        }
        else{
            acc[date_of_transaction][transaction_reason] = count;
        }
        acc[date_of_transaction].count += +count;
        return acc;
    } , {}));

    return (
        <GraphWithStatCard
            title={"Surplus Increments Yearly View"}
            dateInput={
                <YearPickerInput
                    mb={"xl"}
                    label={"Year"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
        }
            isLoading={yearData.length === 0}
            cards={
            [
                <StatCard
                    key={0}
                    stat={{
                        title: "Total Increments",
                        value: (cardData.reduce((a, {count}) => a + count, 0)),
                    }}
                />,
                <StatCard
                    key={1}
                    stat={{
                        title: "Average Increments",
                        value: (Math.round(cardData.reduce((a, {count}) => a + count, 0) / cardData.length)),
                    }}
                />,
                <StatCard
                    key={2}
                    stat={{
                        title: "Best Month",
                        value: (cardData.reduce((a, {count}) => a > count ? a : count, 0)),
                    }}
                />,
                <StatCard
                    key={3}
                    stat={{
                        title: "New Inbound",
                        value: (yearData
                            .filter((item) => (item.transaction_reason === "Add on Receiving" || item.transaction_reason === "Add"))
                            .reduce((acc, {count}) => acc + +count, 0)),
                    }}
                />,
                <StatCard
                    key={4}
                    stat={{
                        title: "Re-listings",
                        value: (yearData
                            .filter((item) => (item.transaction_reason === "Relisting"))
                            .reduce((acc, {count}) => acc + +count, 0)),
                    }}
                />

            ]
        }
        >
            <YearlyChart theme={theme} yearData={yearData} date={date}/>
        </GraphWithStatCard>)
}

export default YearlyView;