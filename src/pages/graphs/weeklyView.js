import React, {useContext, useState} from 'react';
import Container from "react-bootstrap/Container";
import {Chart} from "react-chartjs-2";
import useUpdates from "../../modules/hooks/useUpdates";
import {SundayContext, ThemeContext} from "../layout";
import useGoal from "../../modules/hooks/useGoal";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import makeWeekArray from "../../modules/utils/makeWeekArray";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import Form from "react-bootstrap/Form";
import findSunday from "../../modules/utils/findMondayFromDate";
import {Col, Row} from "react-bootstrap";
import InfoCard from "../../components/infoCards/infocard";
import formatter from "../../modules/utils/numberFormatter";

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
    let monday = findSunday(date);
    let sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return `${formatDateWithZeros(monday)} - ${formatDateWithZeros(sunday)}`;
}




function colorize(goal) {
    return (ctx) => {
        const increments = ctx?.parsed?.y;
        return increments < goal ? "#d00d0d" : "#00ad11";
    }
}

function WeeklyChart({weekData,theme, date, day}){
    let sunday = findSunday(new Date(date),false);
    theme = theme === "dark" ? "#FFF" : "#000";
    weekData = makeWeekArray(weekData,!day,sunday);
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
                max: goal * 2,
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
    const [date,setDate] = useState(formatDateWithZeros(new Date()));
    const weekData = useUpdates("/api/views/weeklyView",{date});
    const theme = useContext(ThemeContext);
    const day = useContext(SundayContext);
    function handleDateChange(e) {
        let date = e.target.value;
        //date.setHours(12);
        //date.setDate(date.getDate() + 1);
       // date = formatDateWithZeros(date);
        setDate(date);
    }
    console.log(date);
    if(weekData.length === 0)return(
        <Container className={"text-center"}>
            <Form.Control className={"mb-5"} value={date} onChange={handleDateChange} type="date" />
            Loading...
        </Container>
    );
    let margin = "3.5rem";
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
                    <Col sm={10} className={"p-1"} style={{border:`1px ${theme === "dark" ? "white" : "black" } solid`}}>
                        {weekData.length > 0 && <WeeklyChart day={day} theme={theme} weekData={weekData} date={date} />}
                    </Col>
                    <Col sm={2}>
                        <InfoCard style={{marginBottom:margin}} title={"Total Increments"} theme={theme}>
                            {formatter(weekData.reduce((acc, {count}) => (acc + +count), 0))}
                        </InfoCard>
                        <InfoCard style={{marginBottom:margin}} title={"Average Increments"} theme={theme}>
                            {formatter(Math.round(weekData.reduce((acc, {count}) => (acc + +count), 0) / 5))}
                        </InfoCard>
                        <InfoCard style={{marginBottom:0}} title={"Best Day"} theme={theme}>
                            {formatter(weekData.reduce((acc, {count}) => (acc > +count ? acc : +count), 0))}
                        </InfoCard>
                    </Col>
                </Row>
            </Container>
        </main>
    )
}

export default WeeklyView;