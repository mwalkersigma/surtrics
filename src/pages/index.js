import Head from 'next/head'
import {Col, Row} from "react-bootstrap";
import React, {useContext} from "react";
import Container from "react-bootstrap/Container";
import useUpdates from "../modules/hooks/useUpdates";
import useGoal from "../modules/hooks/useGoal";
import formatter from "../modules/utils/numberFormatter";
import {Bar, Line} from "react-chartjs-2";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale, LineElement, PointElement,
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {ThemeContext} from "./layout";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    DataLabels,
    PointElement,
    LineElement,
);

function InfoCard ({title,children,subtitle,theme}) {
    return(
        <div className={`info-card ${theme}`}>
            <div>{title}</div>
            <div className={"info"}>
                {children}
            </div>
            <small>{subtitle}</small>
        </div>
    )
}
function BigInfoCard ({title,children,subtitle,theme}) {
    return(
        <div className={`big info-card ${theme}`}>
            <div>{title}</div>
            <div className={"info"}>
                {children}
            </div>
            <small>{subtitle}</small>
        </div>
    )
}

export default function Home() {
    let date = new Date();
    date = date.toISOString().split("T")[0];
    const theme = useContext(ThemeContext)
    const weekData = useUpdates("/api/views/weeklyView");
    const dailyData = useUpdates("/api/views/dailyView",{date});
    const goal = useGoal();

    if (weekData.length === 0 || dailyData.length === 0 ) return <div className={"text-center"}>Loading...</div>

    const totalIncrements = weekData.map(({count}) => +count).reduce((a,b)=>a+b,0);
    const totalForToday = dailyData.reduce((a,b) => a + +b.count,0);

    const dailyAverage = Math.round(totalIncrements / weekData.length || 0);
    const hourlyAverage = Math.round(dailyAverage / 7 || 0);

    const expectedTotal = goal * weekData.length;

    const dailyDifference = weekData.at(-1).count - goal;
    const totalDifference = totalIncrements - expectedTotal - dailyDifference;
  return (
    <>
      <Head>
        <title>Surtrics</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Container className={"mt-5"}>
            <h3 className={"text-center"}>Surplus Metrics Dashboard</h3>
        </Container>
        <Container className={"mt-5"} >
            <Row>
                <Col sm={2} className={"gap-2"}>
                    <InfoCard theme={theme} title={"Total Increments"}>
                        {formatter(totalIncrements)}
                    </InfoCard>
                    <InfoCard theme={theme} title={"Daily Average"}>
                        {formatter(dailyAverage)}
                    </InfoCard>
                </Col>
                <Col sm={2}>
                    <InfoCard theme={theme} title={"Daily Total"} >
                        {(formatter(totalForToday))}
                    </InfoCard>
                    <InfoCard theme={theme} title={"Daily Difference"} subtitle={"between expected and actual"}>
                        {formatter(dailyDifference)}
                    </InfoCard>
                </Col>
                <Col sm={2}>
                    <InfoCard theme={theme} title={"Daily Difference"} >
                        {(formatter(dailyData.at(-1).count - goal))}
                    </InfoCard>
                    <InfoCard theme={theme} title={"Daily Goal"}>
                        {formatter(goal)}
                    </InfoCard>
                </Col>
                <Col sm={2}>
                    <InfoCard theme={theme} title={"Total Difference"} subtitle={"excluding today"}>
                        {formatter(totalDifference)}
                    </InfoCard>
                    <InfoCard theme={theme} title={"Hourly Average"}>
                        {formatter(hourlyAverage)}
                    </InfoCard>
                </Col>
                <Col sm={4}>
                    <BigInfoCard theme={theme} title={"Planned Total"} subtitle={"By end of day"}>
                        {formatter(expectedTotal)}
                    </BigInfoCard>
                </Col>
            </Row>
            <Row>
                <Col sm={4}>
                    <div
                        className={"graph-card text-center"}
                        style={{
                            border: `1px solid ${theme === "dark" ? "#FFF" : "#000"}`,
                            fontSize: "1.5rem",
                        }}
                    >
                        <p>Weekly Snapshot</p>
                        <Bar
                            data={{
                                labels: weekData.map(({date}) => new Date(date).toISOString().split("T")[0]),
                                datasets:[
                                    {
                                        data:weekData.map(({count}) => +count),
                                        borderColor: 'rgb(54, 162, 235)',
                                        backgroundColor: 'rgba(54, 162, 235)',
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
                                        display: false,
                                        ticks: {
                                            color: "#FFF"
                                        }
                                    },
                                    x: {
                                        display: false
                                    }
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
                        }}
                    >
                        <p>Hourly Snapshot</p>
                        <Line
                            data={{
                                labels: dailyData.map(({hour}) => new Date(hour).toISOString().split("T")[1].split(":")[0]),
                                datasets:[
                                    {
                                        data:dailyData.map(({count}) => +count),
                                        borderColor: 'rgb(54, 162, 235)',
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
                                        color: theme === "dark" ? "#ff00ae" : "#000",
                                        align: "top",
                                    },
                                },
                                scales: {
                                    y:{
                                        //display: false,
                                        ticks: {
                                            color: theme === "dark" ? "#FFF" : "#000"
                                        }
                                    },
                                    x: {
                                        display: false
                                    }
                                },
                            }}
                            height={190}
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    </>
  )
}
