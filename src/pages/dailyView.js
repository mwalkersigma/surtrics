import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Container from "react-bootstrap/Container";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function makeHourlyGoal (dailyGoal) {
    let hrs = 12;
    let perHour = Math.floor(dailyGoal / hrs);
    return Array.from({length: hrs}, (_, i) => perHour);
}

let dailyData = [41,41,20,40]

let createAdjustedGoal = (dailyGoal,dailyData) => {
    let hourlyAmount = dailyGoal[0];
    console.log("hourlyAmount : ",hourlyAmount)
    let hours = dailyData.length;
    console.log("hours :",hours)
    let expectedTotal = hourlyAmount * hours;
    console.log("expected total :",expectedTotal)
    let actualTotal = dailyData.reduce((a,b) => a + b);
    console.log("actual total :",actualTotal)
    let difference = expectedTotal - actualTotal;
    console.log("difference :",difference)
    if(difference < 0)return dailyGoal;
    let remainingHours = dailyGoal.length - dailyData.length;
    console.log("remaining hours :",remainingHours)
    let perHour = difference / remainingHours;
    console.log("per hour :",perHour)
    let adjustedGoal = dailyGoal.map((hourlyGoal,i) => {
        if(i >= dailyData.length){
            return hourlyGoal + perHour;
        }else{
            return hourlyGoal;
        }
    })
    return adjustedGoal;

    // let missingFromGoal = 0;
    // for(let i = 0; i < dailyData.length; i++){
    //     let leftoverAfterGoal = dailyGoal[i] - dailyData[i] ;
    //     if(leftoverAfterGoal > 0){
    //         missingFromGoal += leftoverAfterGoal;
    //     }else if(leftoverAfterGoal < 0 && missingFromGoal > 0){
    //         missingFromGoal -= leftoverAfterGoal;
    //     }
    // }
    // console.log(missingFromGoal)
    // // take the amount missing from the goal and spread it out over the next hours
    // let remainingHours = dailyGoal.length - dailyData.length;
    // let perHour = missingFromGoal / remainingHours;
    // let adjustedGoal = dailyGoal.map((hourlyGoal,i) => {
    //     if(i >= dailyData.length){
    //         return hourlyGoal + perHour;
    //     }else{
    //         return hourlyGoal;
    //     }
    // });
    // console.log(adjustedGoal)
    // return adjustedGoal;

}
;
const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Chart.js Line Chart',
        },
    },
    scales:{
        y:{
            min:0,
            max:70,
        }
    }
};
const data = {
    labels: ['5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'],
    datasets: [
        {
            label: "Goal",
            data:createAdjustedGoal(makeHourlyGoal(483),dailyData),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
            label: "Dataset 2",
            data:dailyData,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }
    ]
}

const DailyView = () => {
    return (
        <Container>
            <Line data={data} title={"Daily View"} options={options} />
        </Container>
    );
};

export default DailyView;