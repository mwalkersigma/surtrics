import createAdjustedGoal from "../modules/utils/createAdjustedDailyGoal";
import React from "react";
import useGoal from "../modules/hooks/useGoal";
import {colorScheme} from "../pages/_app";
import BaseChart from "./Chart";

export default function LineGraph (props) {
    let {dailyData,theme,date,...rest} = props;
    const temp = JSON.parse(JSON.stringify(props));
    delete temp.dailyData;
    delete temp.theme;
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    const goal = useGoal({date});
    const options = {
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
        scales:{
            y: {
                min: 0,
                max:150,
            },

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
                type: 'line',

            },
            {
                label: "Adjusted Goal",
                data:createAdjustedGoal(makeHourlyGoal(goal || 0),dailyData),
                borderColor: colorScheme.red,
                backgroundColor: colorScheme.red,
                type: 'line',
            },
            {
                label: "Increments",
                data:dailyData,
                borderColor: colorScheme.blue,
                backgroundColor: colorScheme.blue,
                type: 'line',
            }
        ]
    }
    return (
        <BaseChart {...rest} stacked data={graphData} config={options}/>

    )
}