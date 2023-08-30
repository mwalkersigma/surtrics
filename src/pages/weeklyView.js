// noinspection JSValidateTypes

import React from 'react';
import {  Chart as ChartJS,
    LinearScale, CategoryScale,
    BarElement, PointElement,
    LineElement, Legend,
    Tooltip, LineController,
    BarController,Title,Filler
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import Container from "react-bootstrap/Container";
import {Chart} from "react-chartjs-2";
import getMonday from "../modules/utils/getMonday";
import useUpdates from "../modules/hooks/useUpdates";

ChartJS.register(
    CategoryScale, LinearScale,
    BarElement, Title,
    Tooltip, Legend,
    Filler, LineElement,
    DataLabels,PointElement,
    BarController, LineController
);

const options = {
    plugins: {
        legend: {
            position: "top",
            align: "center",
            labels: {
                boxWidth: 30,
                usePointStyle: true,
            },
            title: {
                text: "Weekly Increments",
                display: true,
                color: "#000",
                font: {
                    size: 30,
                }
            }
        },
        datalabels: {
            color: "#FFF",
            display: (context) => context.dataset.data[context.dataIndex] > 0,
            font: {
                weight: "bold",
            },
            formatter: Math.round
        }
    },
    scales: {
        y: {
            min: 0,
            max: 1000,
        }
    }
}

function colorize(ctx) {
    const increments = ctx?.parsed?.y;
    const goal = 483;
    return increments < goal ? "#d00d0d" : "#00ad11";
}
function makeWeek(){
    let monday = getMonday();
    let week = [];
    for(let i = 0; i < 5; i++){
        week.push(monday.toISOString().split("T")[0]);
        monday.setDate(monday.getDate() + 1);
    }
    return week
}

function WeeklyView() {
    const weekData = useUpdates("/api/views/weeklyView");

    const data = weekData.length > 0 && {
        labels: makeWeek().map((dateString) => (dateString.split("T")[0])),
        datasets: [
            {
                type: "line",
                label: "Goal",
                data: [483,483,483,483,483],
                borderColor: "#5b1fa8",
                borderWidth: 2,
                tension: 0.1,
                borderDash: [0,0],
                pointRadius: 3,
                pointBackgroundColor: "#5b1fa8",
                datalabels: {
                    display: false
                }
            },
            {
                type: "bar",
                label: "Days",
                data: weekData?.map(({count}) => (count)),
                backgroundColor: colorize,
                barThickness: 75,
                borderRadius: 10
            }
        ]
    };

    return (
        <main>
            <Container>
                {weekData.length > 0 && <Chart data={data} type={"bar"} height={150} options={options}/>}
            </Container>
        </main>
    )
}

export default WeeklyView;