import Head from 'next/head'
import {Col, Row} from "react-bootstrap";
import React, {useContext} from "react";
import Container from "react-bootstrap/Container";

import useUpdates from "../modules/hooks/useUpdates";
import useGoal from "../modules/hooks/useGoal";
import formatter from "../modules/utils/numberFormatter";
import makeWeekArray from "../modules/utils/makeWeekArray";
import processWeekData from "../modules/utils/processWeekData";

import {Bar, Line} from "react-chartjs-2";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale, LineElement, PointElement,
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {ThemeContext} from "./layout";

import InfoCard from "../components/infoCards/infocard";
import BigInfoCard from "../components/infoCards/bigInfoCards";



import {subHours, format, addHours, isWeekend} from "date-fns";
import {colorScheme} from "./_app";
import useNav from "../modules/hooks/useNav";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    DataLabels,
    PointElement,
    LineElement,
);



function HomeDisplay(){
    let date = new Date().toISOString().split("T")[0];

    const theme = useContext(ThemeContext)

    const shadowColor = theme === "dark" ? colorScheme.white : colorScheme.dark;

    let weekData = useUpdates("/api/views/increments",{date,interval:"1 week",increment:"day"});
    weekData = processWeekData(weekData);

    let weekDays = weekData.filter(({date}) => !isWeekend(new Date(date)))
    let dailyData = useUpdates("/api/views/increments",{date, interval:"1 day", increment: "hour"});

    const goal = useGoal();
    const hourlyGoal = goal / 7;

    let weekSeed = makeWeekArray(weekData,new Date(date));
    let dateLabels = weekSeed.map(({date}) => format(addHours(new Date(date),6),"EEE MM/dd"));

    if (weekData.length === 0) return <div className={"text-center"}>Loading...</div>

    const totalIncrements = weekSeed.map(({count}) => +count).reduce((a,b)=>a+b,0);
    const totalForToday = dailyData.reduce((a,b) => a + +b.count,0);

    const dailyAverage = Math.round(totalIncrements / weekDays.length || 1);
    const hourlyAverage = Math.round(dailyAverage / 7 || 1);

    const expectedTotal = goal * weekDays.length;

    const dailyDifference = weekData.slice(-1)[0].count - goal;
    const hourlyDifference = Math.round(dailyData.slice(-1)[0]?.count - hourlyGoal)
    const totalDifference = expectedTotal - totalIncrements;

    const bestDay = Math.max(...weekData.map(({count}) => +count));
    const bestHour = Math.max(...dailyData.map(({count}) => +count));

    return (<>
        <Row className={"pb-3"}>
            <Col sm={2}>
                <InfoCard formatter={(value)=>value > goal} theme={theme} title={"Daily Total"} >
                    {(formatter(totalForToday))}
                </InfoCard>
                <InfoCard formatter={(value)=>value > hourlyGoal} theme={theme} style={{marginBottom:0}} title={"Hourly total"} >
                    {formatter(dailyData.slice(-1)[0]?.count)}
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
                            labels: dateLabels,
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
                            labels: dailyData.map(({date_of_transaction}) => +(subHours(new Date(date_of_transaction),7).toLocaleTimeString().split(":")[0])),
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
                <InfoCard formatter={()=> totalDifference < 0} theme={theme} style={{marginBottom:0}} title={"Total Difference"}>
                    {formatter(totalDifference) > 0 ? formatter(totalDifference):0}
                </InfoCard>
            </Col>
            <Col sm={2}>
                <InfoCard formatter={(value)=> value <= 0} theme={theme} title={"Best VS Today"} >
                    {formatter(bestDay - totalForToday)}
                </InfoCard>
                <InfoCard formatter={()=>{
                    return bestHour - dailyData.slice(-1)[0]?.count <= 0
                }} theme={theme} style={{marginBottom:0}} title={"Best HR VS Now"}>
                    {formatter(bestHour - dailyData.slice(-1)[0]?.count)}
                </InfoCard>
            </Col>
            <Col sm={4}>
                <BigInfoCard formatter={(value)=>value > hourlyGoal} theme={theme} title={"Best Hour"}>
                    {formatter(bestHour)}
                </BigInfoCard>
            </Col>
        </Row>
    </>)
}



export default function Home() {
    const hasNavBar = useNav();
  return (
    <>
      <Head>
        <title>Surtrics</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
        <Container className={"mt-5"}>
            {hasNavBar && <h3 className={"text-center"}>Surplus Metrics Dashboard</h3> }
        </Container>
        <Container className={`${hasNavBar ? "mt-5" : "mt-3"}`} ><HomeDisplay/></Container>
    </>
  )
}
