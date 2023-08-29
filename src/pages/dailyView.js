import React, {useState} from 'react';
import {
    Chart as ChartJS, CategoryScale,
    LinearScale, PointElement,Title,
    LineElement, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import useUpdates from "../modules/hooks/useUpdates";
import createAdjustedGoal from "../modules/utils/createAdjustedGoals";

ChartJS.register(
    CategoryScale, LinearScale,
    PointElement, LineElement,
    Title, Tooltip, Legend
);




function LineGraph ({dailyData}) {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Surplus Metrics Daily View',
                color: "#000",
                font: {
                    size: 30,
                }
            },
        },
        scales:{
            y:{
                min:0,
            }
        }
    };
    function makeHourlyGoal (dailyGoal) {
        let hrs = 12;
        let perHour = Math.floor(dailyGoal / hrs);
        return Array.from({length: hrs}, (_, i) => perHour);
    }
    const graphData = {
        labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM','5PM'],
        datasets: [
            {
                label: "Goal",
                data:createAdjustedGoal(makeHourlyGoal(483),dailyData),
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


const convertDate = (date) => `${date.getFullYear()}-${date.getMonth().length > 1 ? "" : "0"}${date.getMonth() + 1}-${date.getDate()}`

const DailyView = () => {
    const [date,setDate] = useState(convertDate(new Date()))
    let dailyData = useUpdates("/api/views/dailyView",{date});
    if(dailyData.length === 0)return(<Container className={"text-center"}>Loading...</Container>);
    dailyData = dailyData.map(({count}) => +count);
    return (
        <Container>
            <Form.Control className={"mb-5"} value={date} onChange={(e)=>setDate(e.target.value)} type="date" />
            <LineGraph dailyData={dailyData} />
        </Container>
    );
};

export default DailyView;