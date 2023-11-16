import React, {useState} from 'react';

import {Chart} from "react-chartjs-2";
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";

import useUpdates from "../../../modules/hooks/useUpdates";
import useGoal from "../../../modules/hooks/useGoal";


import makeWeekArray from "../../../modules/utils/makeWeekArray";
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import formatter from "../../../modules/utils/numberFormatter";
import processWeekData from "../../../modules/utils/processWeekData";
import createAdjustedWeekArray from "../../../modules/utils/createAdjustedWeekArray";
import yymmddTommddyy from "../../../modules/utils/yymmddconverter";

import {colorScheme} from "../../_app";
import {addDays} from "date-fns";
import {useMantineColorScheme, Container, Title, Grid, Skeleton, Stack} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import LineGraph from "../../../components/lineGraph";
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



function getWeekString(date) {
    let sunday = findStartOfWeek(date);
    let saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return `${yymmddTommddyy(formatDateWithZeros(sunday))} through ${yymmddTommddyy(formatDateWithZeros(saturday))}`;
}
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
    let {weekData,theme,date} = props;
    console.log(theme)
    const Theme = (theme) => theme === "dark" ? colorScheme.light : colorScheme.dark;
    const goal = useGoal({date});
    const adjustedWeek = createAdjustedWeekArray(weekData,goal)
                                    .map(item => item > 0 ? +item + +goal  : goal);


    const thickness = 3
    const options = {
        devicePixelRatio: 4,
        responsive: true,
        maintainAspectRatio: false,
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
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
                stacked: true,
                min: 0,
                max: Math.max(goal * 2,adjustedWeek.reduce((acc,curr)=>{return acc > curr ? acc : curr},0)),
                ticks: {
                    color: Theme(theme) + "AA"
                },
                grid: {
                    color: Theme(theme)+"33"
                }
            },
            x:{
                stacked: true,
                ticks: {
                    color: Theme(theme)+ "AA"
                },
                grid: {
                    color: Theme(theme)+"33"
                }
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
    return <Chart data={data} type={"bar"} height={150} options={options}/>
}

function WeeklyView() {
    const [date, setDate] = useState(new Date())
    const {colorScheme:theme} = useMantineColorScheme();

    let weekData = useUpdates("/api/views/increments",{date:formatDateWithZeros(addDays(findStartOfWeek(new Date(date)),1)),interval:"1 week",increment:"day"});


     if(weekData.length === 0) return (
         <Container fluid>
             <Title ta={"center"}>Surplus Increments Weekly View</Title>
             <Grid spacing={"xl"}>
                 <Grid.Col span={1}></Grid.Col>
                 <Grid.Col span={8}>
                     <DatePickerInput
                         mt={"xl"}
                         mb={"xl"}
                         label={"Date"}
                         value={date}
                         onChange={(e) => setDate(e)}
                     />
                 </Grid.Col>
                 <Grid.Col span={3}></Grid.Col>
             </Grid>
             <Grid spacing={"xl"}>
                 <Grid.Col span={1}></Grid.Col>
                 <Grid.Col span={8}>
                     <Skeleton height={"65vh"} radius="md" animate={false}/>
                 </Grid.Col>
                 <Grid.Col span={2}>
                     <Stack>
                         <Skeleton height={110} radius="md" animate={false}/>
                         <Skeleton height={110} radius="md" animate={false}/>
                         <Skeleton height={110} radius="md" animate={false}/>
                         <Skeleton height={110} radius="md" animate={false}/>
                         <Skeleton height={110} radius="md" animate={false}/>
                     </Stack>
                 </Grid.Col>
             </Grid>
         </Container>
     );

    weekData = processWeekData(weekData)
    weekData = makeWeekArray(weekData,new Date(date));
    return (
        <Container fluid>
            <Title ta={"center"}>Surplus Increments Weekly View</Title>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={8}>
                    <DatePickerInput
                        mt={"xl"}
                        mb={"xl"}
                        label={"Date"}
                        value={date}
                        onChange={(e) => setDate(e)}
                    />
                </Grid.Col>
                <Grid.Col span={3}></Grid.Col>
            </Grid>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={8}>
                    <div style={{position: "relative", height: "100%"}} className={"chart-container"}>
                        <WeeklyChart theme={theme} weekData={weekData} date={date}/>
                    </div>
                </Grid.Col>
                <Grid.Col span={2}>
                    <Stack>
                        <StatsCard
                            stat={{
                                title: "Total",
                                value: weekData.reduce((a,b)=>a+b.count,0),
                            }}/>
                        <StatsCard
                            stat={{
                                title: "Average",
                                value: weekData.reduce((a, b) => a + b.count, 0) / weekData.length
                            }}/>
                        <StatsCard
                            stat={{
                                title: "Best Day", value: Math.max(...weekData.map(({count}) => count)),
                            }}/>
                        <StatsCard
                            stat={{
                                title: "New Inbound", value: weekData
                                    .filter((item) => (item["Add"] || item["Add on Receiving"]))
                                    .reduce((acc,item)=>acc + (+item["Add"] || 0) + (+item["Add on Receiving"] || 0),0),
                            }}
                        />
                        <StatsCard
                            stat={{
                                title: "Re-listings", value:weekData
                                        .filter((item) => (item["Relisting"]))
                                        .reduce((acc,item)=>acc + (+item["Relisting"] || 0),0),
                            }}/>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    )
}

export default WeeklyView;