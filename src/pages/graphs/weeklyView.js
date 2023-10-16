import React, {useContext, useState} from 'react';

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {Chart} from "react-chartjs-2";
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";

import {SundayContext, ThemeContext} from "../layout";
import useUpdates from "../../modules/hooks/useUpdates";
import useGoal from "../../modules/hooks/useGoal";


import makeWeekArray from "../../modules/utils/makeWeekArray";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import findStartOfWeek from "../../modules/utils/findSundayFromDate";
import formatter from "../../modules/utils/numberFormatter";
import processWeekData from "../../modules/utils/processWeekData";
import createAdjustedWeekArray from "../../modules/utils/createAdjustedWeekArray";

import InfoCard from "../../components/infoCards/infocard";
import {colorScheme} from "../_app";
import yymmddTommddyy from "../../modules/utils/yymmddconverter";

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
    let {weekData,theme} = props;
    const useTheme = (theme) => theme === "dark" ? colorScheme.light : colorScheme.dark;
    const goal = useGoal();
    const adjustedWeek = createAdjustedWeekArray(weekData,goal)
                                    .map(item => item > 0 ? +item + +goal  : goal);

    const thickness = 3
    const options = {
        devicePixelRatio: 4,
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
                    color: useTheme(theme)+"A",
                    generateLabels:(chart)=>{
                        let data = chart.data;
                        if(data.labels.length && data.datasets.length){
                            return data.datasets.map((dataset, i) => {
                                const meta = chart.getDatasetMeta(i);
                                return {
                                    text: dataset.label,
                                    fillStyle: dataset.backgroundColor || dataset.borderColor,
                                    strokeStyle: dataset.backgroundColor || dataset.borderColor,
                                    hidden: meta.hidden,
                                    index: i,
                                    datasetIndex: i
                                }
                            })
                        }
                        console.log("No Data")
                        return [];
                    }
                },
                title: {
                    text: "Weekly Increments",
                    display: true,
                    color: useTheme(theme),
                    font: {
                        size: 30,
                    }
                }
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
                    color: useTheme(theme) + "AA"
                },
                grid: {
                    color: useTheme(theme)+"33"
                }
            },
            x:{
                stacked: true,
                ticks: {
                    color: useTheme(theme)+ "AA"
                },
                grid: {
                    color: useTheme(theme)+"33"
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

    const [date,setDate] = useState(formatDateWithZeros(new Date()));

    let weekData = useUpdates("/api/views/weeklyView",{date});

    const theme = useContext(ThemeContext);


    function handleDateChange(e) {
        setDate(e.target.value);
    }
    if(weekData.length === 0)return(
        <Container className={"text-center"}>
            <Form.Control className={"mb-5"} value={date} onChange={handleDateChange} type="date" />
            Loading...
        </Container>
    );
    let margin = "3.5rem";
    weekData = processWeekData(weekData)
    weekData = makeWeekArray(weekData,new Date(date));
    return (
        <main>
            <Container>
                <Row>
                    <Form.Control
                        className={"mb-3"}
                        value={date}
                        onChange={handleDateChange}
                        type="date"
                    />
                </Row>
                Showing data for {getWeekString(new Date(date))}.
                <div className={"mb-3"} />
                <Row>
                    <Col sm={10} className={`p-1 themed-drop-shadow ${theme}`} style={{border:`1px ${theme === "dark" ? "white" : "black" } solid`}}>
                        {weekData.length > 0 && <WeeklyChart theme={theme} weekData={weekData} date={date} />}
                    </Col>
                    <Col sm={2}>
                        <InfoCard style={{marginBottom:margin}} title={"Total Increments"} theme={theme}>
                            {formatter(weekData.reduce((acc, {count}) => (acc + +count), 0))}
                        </InfoCard>
                        <InfoCard style={{marginBottom:margin}} title={"New Inbound"} theme={theme}>
                            {
                                formatter(weekData
                                    .filter((item) => (item["Add"] || item["Add on Receiving"]))
                                    .reduce((acc,item)=>acc + (+item["Add"] || 0) + (+item["Add on Receiving"] || 0),0)
                                )
                            }
                        </InfoCard>
                        <InfoCard style={{marginBottom:0}} title={"Re-listings"} theme={theme}>
                            {
                                formatter(
                                    weekData
                                    .filter((item) => (item["Relisting"]))
                                    .reduce((acc,item)=>acc + (+item["Relisting"] || 0),0)
                                )
                            }
                        </InfoCard>
                    </Col>
                </Row>
            </Container>
        </main>
    )
}

export default WeeklyView;