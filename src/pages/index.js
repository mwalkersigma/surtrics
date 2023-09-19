import Head from 'next/head'
import {Col, Row} from "react-bootstrap";
import React, {useContext} from "react";
import Container from "react-bootstrap/Container";

import useUpdates from "../modules/hooks/useUpdates";
import useGoal from "../modules/hooks/useGoal";
import formatter from "../modules/utils/numberFormatter";
import makeWeekArray from "../modules/utils/makeWeekArray";
import findStartOfWeek from "../modules/utils/findMondayFromDate";
import processWeekData from "../modules/utils/processWeekData";

import {Bar, Line} from "react-chartjs-2";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale, LineElement, PointElement,
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {SundayContext, ThemeContext} from "./layout";

import InfoCard from "../components/infoCards/infocard";
import BigInfoCard from "../components/infoCards/bigInfoCards";



import {subHours, format, addHours} from "date-fns";
import {colorScheme} from "./_app";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    DataLabels,
    PointElement,
    LineElement,
);

const convertDateToDay = (date) => {
    return format(addHours(new Date(date),5),"EEE MM/dd")
}



export default function Home() {
    let date = new Date();
    date = date.toISOString().split("T")[0];

    const theme = useContext(ThemeContext)
    const day = useContext(SundayContext)

    const shadowColor = theme === "dark" ? colorScheme.white : colorScheme.dark;

    let weekData = useUpdates("/api/views/weeklyView",{date});
    weekData = processWeekData(weekData)
    let dailyData = useUpdates("/api/views/dailyView",{date});

    const goal = useGoal();
    const hourlyGoal = goal / 7;

    let weekSeed = makeWeekArray([...weekData],day,findStartOfWeek(new Date(date)));

    if(dailyData.length === 0){
        dailyData = []
    }
    if (weekData.length === 0) return <div className={"text-center"}>Loading...</div>

    const totalIncrements = weekSeed.map(({count}) => +count).reduce((a,b)=>a+b,0);
    const totalForToday = dailyData.reduce((a,b) => a + +b.count,0);

    const dailyAverage = Math.round(totalIncrements / weekData.length || 0);
    const hourlyAverage = Math.round(dailyAverage / 7 || 0);

    const expectedTotal = goal * weekData.length;

    const dailyDifference = weekData.at(-1).count - goal;
    const hourlyDifference = Math.round(dailyData.at(-1)?.count - hourlyGoal)
    const totalDifference = expectedTotal - totalIncrements;

    const bestDay = Math.max(...weekData.map(({count}) => +count));
    const bestHour = Math.max(...dailyData.map(({count}) => +count));



  return (
    <>
      <Head>
        <title>Surtrics</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
        <Container className={"mt-5"}>
            <h3 className={"text-center"}>Surplus Metrics Dashboard</h3>
        </Container>
        <Container className={"mt-5"} >
            <Row className={"pb-3"}>
                <Col sm={2}>
                    <InfoCard formatter={(value)=>value > goal} theme={theme} title={"Daily Total"} >
                        {(formatter(totalForToday))}
                    </InfoCard>
                    <InfoCard formatter={(value)=>value > hourlyGoal} theme={theme} style={{marginBottom:0}} title={"Hourly total"} >
                        {formatter(dailyData.at(-1)?.count)}
                    </InfoCard>
                </Col>
                <Col sm={2}>
                    <InfoCard formatter={(value)=>value > goal} theme={theme}  title={"Daily Average"}>
                        {formatter(dailyAverage)}
                    </InfoCard>
                    <InfoCard formatter={(value)=>value > hourlyGoal} theme={theme} style={{marginBottom:0}} title={"Hourly Average"}>
                        {formatter(hourlyAverage)}
                    </InfoCard>

                </Col>
                <Col sm={2}>
                    <InfoCard theme={theme} title={"Daily Goal"}>
                        {formatter(goal)}
                    </InfoCard>
                    <InfoCard theme={theme} style={{marginBottom:0}} title={"Hourly Goal"}>
                        {formatter(Math.round(hourlyGoal))}
                    </InfoCard>
                </Col>
                <Col sm={2}>
                    <InfoCard formatter={(value)=> value > 0} theme={theme}  title={"Daily Difference"}>
                        {formatter(dailyDifference)}
                    </InfoCard>
                    <InfoCard formatter={(value)=> value > 0} theme={theme} style={{marginBottom:0}} title={"Hourly Difference"}>
                        {formatter(hourlyDifference)}
                    </InfoCard>
                </Col>
                <Col sm={4}>
                    <BigInfoCard theme={theme} title={"Total Increments"}>
                        {formatter(totalIncrements)}
                    </BigInfoCard>
                </Col>
            </Row>
            <Row className={"pb-3"}>
                <Col sm={4}>
                    <div
                        className={`graph-card text-center`}
                        style={{
                            border: `1px solid ${theme === "dark" ? "#FFF" : "#000"}`,
                            boxShadow: `3px 3px ${shadowColor}`,
                            fontSize: "1.5rem",
                        }}
                    >
                        <p>Daily Snapshot</p>
                        <Bar
                            data={{
                                labels:weekSeed.map(({date}) => convertDateToDay(date)),
                                datasets:[
                                    {
                                        data:weekSeed.map(({count}) => +count),
                                        borderColor: (ctx) => ctx?.parsed?.y < goal ? colorScheme.red : colorScheme.green,
                                        backgroundColor: (ctx) => ctx?.parsed?.y < goal ? colorScheme.red : colorScheme.green,
                                    }
                                ]
                            }}
                            options={{
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    datalabels: {
                                        color: "#FFF",
                                    },
                                },
                                scales: {
                                    y:{
                                        min: 0,
                                        max: goal * 2,
                                        display: false,
                                        ticks: {
                                            color: "#FFF"
                                        }
                                    },
                                },
                            }}
                            height={190}
                        />
                    </div>
                </Col>
                <Col sm={4}>
                    <BigInfoCard theme={theme} title={"Weekly Goal"}>
                        {formatter(goal * 5)}
                    </BigInfoCard>
                </Col>
                <Col sm={4}>
                    <div
                        className={"graph-card text-center"}
                        style={{
                            border: `1px solid ${theme === "dark" ? "#FFF" : "#000"}`,
                            fontSize: "1.5rem",
                            boxShadow: `3px 3px ${shadowColor}`,
                        }}
                    >
                        <p>Hourly Snapshot</p>
                        <Line
                            data={{
                                labels: dailyData.map(({hour}) => +(subHours(new Date(hour),5).toLocaleTimeString().split(":")[0])),
                                datasets:[
                                    {
                                        data:dailyData.map(({count}) => +count),
                                        borderColor:'rgba(54, 162, 235, 1)',
                                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                    }
                                ]
                            }}
                            options={{
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    datalabels: {
                                        display: false,
                                        color: theme === "dark" ? "#fff" : "#000",
                                        align: "top",
                                    },
                                },
                                scales: {
                                    y:{
                                        ticks: {
                                            color: theme === "dark" ? "#FFF" : "#000"
                                        }
                                    },
                                },
                            }}
                            height={190}
                        />
                    </div>
                </Col>
            </Row>
            <Row style={{marginBottom:'5rem'}}>
                <Col sm={4}>
                    <BigInfoCard formatter={(value)=>value > goal} theme={theme} title={"Best Day"}>
                        {formatter(bestDay)}
                    </BigInfoCard>
                </Col>
                <Col sm={2} className={"gap-2"}>
                    <InfoCard theme={theme} title={"Planned Total"} subtitle={"By end of day"}>
                        {formatter(expectedTotal)}
                    </InfoCard>
                    <InfoCard theme={theme} style={{marginBottom:0}} title={"Total Difference"}>
                       <span className={`${totalDifference > 0 ? "text-danger" : ""}`}>{formatter(totalDifference) > 0 ? formatter(totalDifference):0}</span>
                    </InfoCard>
                </Col>
                <Col sm={2}>
                    <InfoCard formatter={(value)=> value >= 0} theme={theme} title={"Best VS Today"} >
                        {formatter(bestDay - totalForToday)}
                    </InfoCard>
                    <InfoCard formatter={(value)=>{
                        return bestHour - dailyData.at(-1)?.count <= 0
                    }} theme={theme} style={{marginBottom:0}} title={"Best HR VS Now"}>
                        {formatter(bestHour - dailyData.at(-1)?.count)}
                    </InfoCard>
                </Col>
                <Col sm={4}>
                    <BigInfoCard formatter={(value)=>value > hourlyGoal} theme={theme} title={"Best Hour"}>
                        {formatter(bestHour)}
                    </BigInfoCard>
                </Col>
            </Row>
        </Container>
    </>
  )
}
