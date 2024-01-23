import React, {useState} from 'react';



import useUpdates from "../../../modules/hooks/useUpdates";
import useGoal from "../../../modules/hooks/useGoal";


import makeWeekArray from "../../../modules/utils/makeWeekArray";
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import processWeekData from "../../../modules/utils/processWeekData";
import createAdjustedWeekArray from "../../../modules/utils/createAdjustedWeekArray";
import yymmddTommddyy from "../../../modules/utils/yymmddconverter";

import {colorScheme} from "../../_app";
import {addDays} from "date-fns";
import {useMantineColorScheme} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import StatCard from "../../../components/mantine/StatCard";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useEvents from "../../../modules/hooks/useEvents";





function colorize(goal) {
    return (ctx) => {
        let stack = ctx?.parsed?._stacks.y;
        let excluded = ["_top", "_bottom", "_visualValues"];
        let total = 0;
        for (let key in stack) {
            if (excluded.includes(key)) continue;
            total += stack[key];
        }
        return total < goal ? colorScheme.red : colorScheme.green;
    }
}

function returnDayOfWeek(date) {
    const d = new Date(date.split("T")[0]);
    d.setDate(d.getDate() + 1);
    return d.toString().split(" ")[0];
}

function WeeklyChart(props){
    let {weekData,theme,date,events} = props;
    const Theme = (theme) => theme === "dark" ? colorScheme.light : colorScheme.dark;
    const goal = useGoal({date});
    const adjustedWeek = createAdjustedWeekArray(weekData,goal)
                                    .map(item => item > 0 ? +item + +goal  : goal);
    const thickness = 3
    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || "";
                        if(label === "adjustedGoal")return "";
                        if(label === "Total")return`Total: ${context.dataset.data[context.dataIndex]}`;
                    },
                    labelColor: function(context) {
                        return {
                            borderColor: context.dataset.backgroundColor || context.dataset.borderColor,
                            backgroundColor: context.dataset.backgroundColor || context.dataset.borderColor
                        };
                    },
                }
            },
            legend: {
                position: "top",
                align: "center",
                labels: {
                    borderless: true,
                    usePointStyle: true,
                    generateLabels:(chart)=>{
                        let data = chart.data;
                        if(data.labels.length && data.datasets.length){
                            return data.datasets.map((dataset, i) => {
                                const meta = chart.getDatasetMeta(i);
                                return {
                                    text: dataset.label,
                                    fontColor: Theme(theme) + "AA",
                                    fillStyle: dataset.backgroundColor || dataset.borderColor,
                                    strokeStyle: dataset.backgroundColor || dataset.borderColor,
                                    hidden: meta.hidden,
                                    index: i,
                                    datasetIndex: i
                                }
                            })
                        }
                        return [];
                    }
                },
            },
            datalabels: {
                color: colorScheme.white,
                display: (context) => context.dataset.data[context.dataIndex] > 50,
                font: {
                    weight: "bold",
                }
            },
        },
        scales: {
            y: {
                stacked: true,
                max: Math.max(goal * 2,adjustedWeek.reduce((acc,curr)=>{return acc > curr ? acc : curr},0)),
            },
            x:{
                stacked: true,
            }
        },
    }
    const data = weekData.length > 0 && {
        labels: weekData.map(({date}) => (`${returnDayOfWeek(date)} ${yymmddTommddyy(date.split("T")[0])}`)),
        datasets: [
            {
                type: "bar",
                label: "Incrementation",
                data: weekData?.map((item) => +item["Add"] || 0),
                borderColor:colorize(goal),
                backgroundColor:colorScheme.green,
                borderWidth: thickness,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0",
                datalabels: {
                    display: false
                },
                order:4
            },
            {
                type: "bar",
                label: "New Inbound",
                data: weekData?.map((item) => +item["Add on Receiving"] || 0),
                borderColor:colorize(goal),
                backgroundColor:colorScheme.red,
                borderWidth: thickness,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0",
                datalabels: {
                    display: false
                },
                order:4
            },
            {
                type: "bar",
                label: "Relisting",
                data: weekData?.map((item) => +item["Relisting"] || 0),
                borderColor:colorize(goal),
                borderWidth: thickness,
                backgroundColor:colorScheme.blue,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0",
                datalabels: {
                    display: false
                },
                order:4
            },
            {
                type: "line",
                label: "Goal",
                data: Array.from({length: 7}, () => (goal)),
                pointBackgroundColor: colorScheme.purple,
                borderColor: colorScheme.purple,
                datalabels: {
                    display: false
                },
                stack: "stack1",
                order:1
            },
            {
                type: "line",
                label: "adjustedGoal",
                data: adjustedWeek,
                pointBackgroundColor: colorScheme.red,
                borderColor: colorScheme.red,
                datalabels: {
                    color: "#FFF",
                    backgroundColor: theme === 'light' && "#000A",
                    display: (context) => context.dataset.data[context.dataIndex]-goal > 0 && "auto",
                    formatter: (value) => Math.round(value - goal)

                },
                order:2,
                stack: "stack2"
            },
            {
                type: "line",
                label: "Total",
                data: weekData?.map((item) => +item["count"] || 0),
                showLine: false,
                pointBackgroundColor: colorScheme.blue,
                borderColor: colorScheme.blue,
                datalabels: {
                    color: "#FFF",
                    backgroundColor: theme === 'light' && "#000A",
                }
            }
        ]
    };
    return <BaseChart events={events} stacked data={data} config={options}/>
}

function WeeklyView() {
    useUsage("Metrics","Increments-weekly-chart")
    const [date, setDate] = useState(new Date())
    const {colorScheme:theme} = useMantineColorScheme();

    let weekData = useUpdates("/api/views/increments",{date:formatDateWithZeros(addDays(findStartOfWeek(new Date(date)),1)),interval:"1 week",increment:"day"});

    weekData = processWeekData(weekData)
    weekData = makeWeekArray(weekData,new Date(date));

    const {reducedEvents} = useEvents({
        startDate:weekData[0].date,
        endDate:weekData[weekData.length - 1].date,
        timeScale:'day',
        includedCategories:['Processing'],
        affected_categories:['Processing'],
        minY:600,
    })
    return (
        <GraphWithStatCard
            title={"Surplus Increments Weekly View"}
            dateInput={
                <DatePickerInput
                    mb={"xl"}
                    label={"Date"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            isLoading={weekData.length === 0}
            cards={
                [
                    <StatCard
                        key={0}
                        stat={{
                            title: "Total Increments",
                            value: (weekData.reduce((a, b) => a + b.count, 0)),
                        }}/>,
                    <StatCard
                        key={1}
                        stat={{
                            title: "Average Increments",
                            value: (Math.round(weekData.reduce((a, b) => a + b.count, 0) / weekData.length)),
                        }}/>,
                    <StatCard
                        key={2}
                        stat={{
                            title: "Best Day", value: (weekData.reduce((a, b) => a > b.count ? a : b.count, 0)),
                        }}/>,
                    <StatCard
                        key={3}
                        stat={{
                            title: "New Inbound",
                            value: weekData
                                .reduce((acc,cur)=>acc + ((+cur["Add"] || 0) + (+cur["Add on Receiving"] || 0)),0)
                            }}
                    />,
                    <StatCard
                        key={4}
                        stat={{
                            title: "Relisting",
                            value: weekData
                                .reduce((acc,cur)=>acc + (+cur["Relisting"] || 0),0)
                        }}
                    />

                ]
            }
        >
            <WeeklyChart events={reducedEvents(weekData.map(({date})=>date))} date={date} weekData={weekData} theme={theme}/>
        </GraphWithStatCard>
    );
}

export default WeeklyView;