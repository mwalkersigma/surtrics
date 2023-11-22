import createAdjustedGoal from "../modules/utils/createAdjustedDailyGoal";
import {Line} from "react-chartjs-2";
import React from "react";
import useGoal from "../modules/hooks/useGoal";
import {colorScheme} from "../pages/_app";

export default function LineGraph (props) {
    let {dailyData,theme,date} = props;
    const temp = JSON.parse(JSON.stringify(props));
    delete temp.dailyData;
    delete temp.theme;
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    const goal = useGoal({date});
    const options = {
        devicePixelRatio: 4,
        responsive: true,
        maintainAspectRatio: false,
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
        },
        interaction: {
            mode: 'index',
            intersect: false,
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
                borderColor: colorScheme.purple,
                backgroundColor: colorScheme.purple,

            },
            {
                label: "Adjusted Goal",
                data:createAdjustedGoal(makeHourlyGoal(goal || 0),dailyData),
                borderColor: colorScheme.red,
                backgroundColor: colorScheme.red,
            },
            {
                label: "Increments",
                data:dailyData,
                borderColor: colorScheme.blue,
                backgroundColor: colorScheme.blue,
            }
        ]
    }
    return (
        <Line {...temp} data={graphData} options={options} />
    )
}