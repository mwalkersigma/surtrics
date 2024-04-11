import React, {useState} from 'react';

import useUpdates from "../../../../modules/hooks/useUpdates";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Tooltip as tt
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {colorScheme} from "../../../_app";
import {eachMonthOfInterval, lastDayOfYear, setDate, setMonth} from "date-fns";
import {Slider, Text, Tooltip, useMantineColorScheme} from "@mantine/core";
import GraphWithStatCard from "../../../../components/mantine/graphWithStatCard";
import {YearPickerInput} from "@mantine/dates";
import StatCard from "../../../../components/mantine/StatCard";
import useUsage from "../../../../modules/hooks/useUsage";
import BaseChart from "../../../../components/Chart";
import useEvents from "../../../../modules/hooks/useEvents";
import useGoal from "../../../../modules/hooks/useGoal";
import {useDebouncedValue, useLogger} from "@mantine/hooks";
import smoothData from "../../../../modules/utils/graphUtils/smoothData";
import colorizeLine from "../../../../modules/utils/colorizeLine";
import formatter from "../../../../modules/utils/numberFormatter";
import compoundArray from "../../../../modules/utils/compoundArray";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    tt,
    Legend,
    LineElement,
    DataLabels,
    PointElement,
);






function YearlyChart(props){
    let { yearData, theme } = props;

    yearData =  yearData
        .map((item)=>({...item, ...{date_of_transaction: item.date_of_transaction.split("T")[0]}}))
        .sort((a,b)=> new Date(a.date_of_transaction) - new Date(b.date_of_transaction));

    let add = yearData.filter(({transaction_reason})=>transaction_reason === "Add").map(({count}) => +count);
    add = compoundArray(add);

    let addOnReceiving = yearData.filter(({transaction_reason})=>transaction_reason === "Add on Receiving").map(({count}) => +count);
    addOnReceiving = compoundArray(addOnReceiving);

    let reListings = yearData.filter(({transaction_reason})=>transaction_reason === "Relisting").map(({count}) => +count);
    reListings = compoundArray(reListings);

    let total = yearData.map(({count}) => +count)
    total = compoundArray(total);
    total = total[total.length - 1]

    const useTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 4,
        plugins: {
            tooltip: {
                callbacks: {
                    footer: (context)=> {
                        return "TOTAL: " + context.filter((context)=>{
                            return context.dataset.label !== "Goal" && context.dataset.label !== "trend"
                        }).reduce((acc, {raw}) => (acc + +raw), 0);
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
                formatter:(val) => formatter(val)
            },
        },
        scales: {
            y: {
                stacked: true,
                min: 0,
                max: total * 1.6,
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




    const data = yearData.length > 0 && {
        labels: months,
        datasets: [
            {
                type: "bar",
                label: "Incrementation",
                data: add,
                borderRadius: 5,
                stack: "stack0"
            },
{
                type: "bar",
                label: "Add on Receiving",
                data: addOnReceiving,
                borderRadius: 5,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Re-listings",
                data: reListings,
                borderRadius: 5,
                stack: "stack0"
            }
        ]
    };



    return <BaseChart customColors stacked events={props.events} data={data} config={options}/>
}



let dateSet = setDate
function Index() {
    useUsage("Metrics","Increments-yearly-chart")
    const [date,setDate] = useState(dateSet(setMonth(new Date(),0),1));
    let yearData = useUpdates("/api/views/increments",{date,interval:"1 year",increment:"month"});

    let skillAssessmentData = useUpdates("/api/dataEntry/skillAssessment");
    console.log(skillAssessmentData)

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
            title={"Surplus Increments Compounded"}
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
                            title: "Add on Receiving",
                            value: (yearData
                                .filter((item) => (item.transaction_reason === "Add on Receiving"))
                                .reduce((acc, {count}) => acc + +count, 0)),
                        }}
                    />,
                    <StatCard
                        key={2}
                        stat={{
                            title: "Add",
                            value: (yearData
                                .filter((item) => ( item.transaction_reason === "Add" ))
                                .reduce((acc, {count}) => acc + +count, 0)),
                        }}
                    />,
                    <StatCard
                        key={3}
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
            <YearlyChart
                theme={theme}
                yearData={yearData}
                date={date}
            />
        </GraphWithStatCard>
    )
}

export default Index;