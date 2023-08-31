import createAdjustedGoal from "../modules/utils/createAdjustedGoals";
import {Line} from "react-chartjs-2";
import React from "react";
import useGoal from "../modules/hooks/useGoal";

export default function LineGraph ({dailyData,theme}) {
    theme = theme === "dark" ? "#FFF" : "#000";
    const goal = useGoal();
    const options = {
        responsive: true,
        plugins: {
            datalabels:{
                display: false,
            },
            legend: {
                position: 'top',
                color: theme,
                labels:{
                    color: theme + "A",
                }
            },
            title: {
                display: true,
                text: 'Surplus Metrics Daily View',
                color: theme,
                font: {
                    size: 30,
                }
            },
        },
        scales:{
            y: {
                min: 0,
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
        }
    };
    function makeHourlyGoal (dailyGoal) {
        let hrs = 12;
        let perHour = Math.floor(dailyGoal / hrs);
        return Array.from({length: hrs}, () => perHour);
    }
    const graphData = {
        labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM','5PM'],
        datasets: [
            {
                label: "Goal",
                data:makeHourlyGoal(goal || 0),
                borderColor: 'rgb(0,173,17)',
                backgroundColor: 'rgb(0,173,17)',
            },
            {
                label: "Adjusted Goal",
                data:createAdjustedGoal(makeHourlyGoal(goal || 0),dailyData),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: "Increments",
                data:dailyData,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            }
        ]
    }
    return (
        <Line data={graphData} title={"Daily View"} options={options} />
    )
}