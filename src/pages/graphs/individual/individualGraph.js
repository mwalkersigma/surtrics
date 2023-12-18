import React, {useState} from 'react';

import useUpdates from "../../../modules/hooks/useUpdates";

import formatter from "../../../modules/utils/numberFormatter";
import {colorScheme} from "../../_app";
import {useMantineColorScheme} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";



let colorPalette = [
    "blue",
    "indigo",
    "purple",
    "pink",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "cyan",
]

function pickRandomColorFromColorScheme() {
    let colors = colorPalette;
    return colorScheme[colors[Math.floor(Math.random() * colors.length)]];
}





function IndividualChart(props){
    let {individualData,theme} = props;
    const useTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        if(context.raw === 0) return "";
                        return context.dataset.label + ": " + formatter(context.raw);
                    },
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
    let dataForChart = JSON.parse(individualData);
    let types = new Set();
    Object
        .values(dataForChart)
        .forEach(user=>{
            Object.keys(user).forEach(key => types.add(key));
        })
    const data = individualData.length > 0 && {
        labels: Object.keys(dataForChart),
        datasets:
        types.size > 0 && [...types].map((type)=> {
            if(type === 'Create -'){
                return {
                    type: "bar",
                    label: type,
                    data: Object.values(dataForChart).map((user) => +user[type] / 4  || 0) ,
                    backgroundColor: pickRandomColorFromColorScheme(),
                    maxBarThickness: 100,
                }
            }
            return {
                type: "bar",
                label: type,
                data: Object.values(dataForChart).map((user) => user[type] || 0),
                backgroundColor: pickRandomColorFromColorScheme(),
                maxBarThickness: 100,
            }
        })
    };
    return <BaseChart stacked data={data}  config={options}/>
}




function UserGraph() {
    useUsage("Metrics","individual-daily-chart")
    const [date, setDate] = useState(new Date());
    let individualData = useUpdates("/api/views/individualView", {date});
    const {colorScheme: theme} = useMantineColorScheme();
    return (
        <GraphWithStatCard
            title={"User View"}
            isLoading={individualData.length === 0}
            dateInput={
                <DatePickerInput
                    mb={"xl"}
                    label={"Date"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            cards={[]}>
            <IndividualChart theme={theme} individualData={individualData} date={date}/>
        </GraphWithStatCard>
    )
}

export default UserGraph;