import React, {useContext} from 'react';
import Container from "react-bootstrap/Container";
import {Chart} from "react-chartjs-2";
import getMonday from "../../modules/utils/getMonday";
import useUpdates from "../../modules/hooks/useUpdates";
import {ThemeContext} from "../layout";
import useGoal from "../../modules/hooks/useGoal";





function colorize(goal) {
    return (ctx) => {
        const increments = ctx?.parsed?.y;
        const goal = 483;
        return increments < goal ? "#d00d0d" : "#00ad11";
    }
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

function WeeklyChart({weekData,theme}){
    theme = theme === "dark" ? "#FFF" : "#000";
    weekData = [...weekData
        //,{count: '195', date: '2023-09-01T05:00:00.000Z'},{count: '215', date: '2023-09-02T05:00:00.000Z'},{count: '320', date: '2023-09-03T05:00:00.000Z'}
    ]
    const goal = useGoal();
    const options = {
        plugins: {
            legend: {
                position: "top",
                align: "center",
                labels: {
                    boxWidth: 30,
                    usePointStyle: true,
                    color: theme+"A",
                },
                title: {
                    text: "Weekly Increments",
                    display: true,
                    color: theme,
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
            },
        },
        scales: {
            y: {
                min: 0,
                max: 1000,
                ticks: {
                    color: theme + "A"
                },
                grid: {
                    color: theme + "3"
                }
            },
            x:{
                ticks: {
                    color: theme + "A"
                },
                grid: {
                    color: theme + "3"
                }
            }
        },
    }
    const data = weekData.length > 0 && {
        labels: weekData.map(({date}) => (date.split("T")[0])),
        datasets: [
            {
                type: "line",
                label: "Goal",
                data: Array.from({length: 7}, () => (goal)),
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
                backgroundColor: colorize(goal),
                barThickness: 75,
                borderRadius: 10
            }
        ]
    };
    return <Chart data={data} type={"bar"} height={150} options={options}/>
}



function WeeklyView() {
    const weekData = useUpdates("/api/views/weeklyView");
    const theme = useContext(ThemeContext)
    return (
        <main>
            <Container>
                {weekData.length > 0 && <WeeklyChart theme={theme} weekData={weekData} />}
            </Container>
        </main>
    )
}

export default WeeklyView;