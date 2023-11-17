import React, {useContext, useState} from 'react';
import Container from "react-bootstrap/Container";

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
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import Form from "react-bootstrap/Form";
import {Col, Row} from "react-bootstrap";
import InfoCard from "../../../components/infoCards/infocard";
import formatter from "../../../modules/utils/numberFormatter";
import {colorScheme} from "../../_app";
import {getMonth, setDate, setMonth} from "date-fns";
import {useMantineColorScheme} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {YearPickerInput} from "@mantine/dates";
import StatsCard from "../../../components/mantine/StatsCard";

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

    const monthes = [ "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    yearData =  yearData.map((item)=>{
        const {date_of_transaction} = item;
        return{...item, ...{date_of_transaction: getMonth(new Date(date_of_transaction))+1}}
    }).sort((a,b)=>a.date_of_transaction - b.date_of_transaction)
    const data = yearData.length > 0 && {
        labels: Array.from(new Set(yearData?.map(({date_of_transaction}) => (monthes[date_of_transaction-1])))),
        datasets: [
            {
                type: "bar",
                label: "New Inbound",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add on Receiving").map(({count}) => (+count)),
                backgroundColor: colorScheme.red,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Incrementation",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add").map(({count}) => (+count)),
                backgroundColor: colorScheme.green,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Relisting",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Relisting").map(({count}) => (+count)),
                backgroundColor: colorScheme.blue,
                barThickness: 75,
                borderRadius: 10,
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
    console.log(cardData)
    return (
        <GraphWithStatCard
            title={"Surplus Increments Yearly View"}
            dateInput={
                <YearPickerInput
                    mt={"xl"}
                    mb={"xl"}
                    label={"Year"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
        }
            isLoading={yearData.length === 0}
            cards={
            [
                <StatsCard
                    key={0}
                    stat={{
                        title: "Total",
                        value: (cardData.reduce((a, {count}) => a + count, 0)),
                    }}
                />,
                <StatsCard
                    key={1}
                    stat={{
                        title: "Average",
                        value: (Math.round(cardData.reduce((a, {count}) => a + count, 0) / cardData.length)),
                    }}
                />,
                <StatsCard
                    key={2}
                    stat={{
                        title: "Best Month",
                        value: (cardData.reduce((a, {count}) => a > count ? a : count, 0)),
                    }}
                />,
                <StatsCard
                    key={3}
                    stat={{
                        title: "New Inbound",
                        value: (yearData
                            .filter((item) => (item.transaction_reason === "Add on Receiving" || item.transaction_reason === "Add"))
                            .reduce((acc, {count}) => acc + +count, 0)),
                    }}
                />,
                <StatsCard
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