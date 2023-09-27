import React, {useContext, useState} from 'react';
import Container from "react-bootstrap/Container";
import {Chart} from "react-chartjs-2";
import useUpdates from "../../modules/hooks/useUpdates";
import {ThemeContext} from "../layout";

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
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import Form from "react-bootstrap/Form";
import {Col, Row} from "react-bootstrap";
import InfoCard from "../../components/infoCards/infocard";
import formatter from "../../modules/utils/numberFormatter";
import {colorScheme} from "../_app";

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

let colorPalette = [
    "blue",
    "indigo",
    "purple",
    "pink",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "cyan",
]

function pickRandomColorFromColorScheme() {
    let colors = colorPalette;
    return colorScheme[colors[Math.floor(Math.random() * colors.length)]];
}





function YearlyChart(props){
    let {individualData,theme} = props;
    const useTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;

    const options = {
        devicePixelRatio: 4,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        if(context.raw === 0) return "";
                        return context.dataset.label + ": " + formatter(context.raw);
                    },
                    footer: (context)=> {
                        return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }
            },
            legend: {
                position: "top",
                align: "center",
                labels: {
                    boxWidth: 30,
                    usePointStyle: true,
                    color: useTheme(theme)+"A",
                },
                title: {
                    text: "User View",
                    display: true,
                    color: useTheme(theme),
                    font: {
                        size: 30,
                    }
                },

            },
            datalabels: {
                color: colorScheme.white,
                display: (context) => context.dataset.data[context.dataIndex] > 200,
                font: {
                    weight: "bold",
                },
                formatter: Math.round
            },
        },
        interaction:{
            intersect: false,
            mode: "index"
        },
        scales: {
            y: {
                stacked: true,
                min: 0,
                ticks: {
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            },
            x:{
                stacked: true,
                ticks: {
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            }
        },
    }
    let dataForChart = JSON.parse(individualData);
    let types = new Set();
    Object
        .values(dataForChart)
        .forEach(user=>{
            Object.keys(user).forEach(key => types.add(key));
        })
    const data = individualData.length > 0 && {
        labels: Object.keys(dataForChart),
        datasets:
        types.size > 0 && [...types].map((type,index)=> {
            return {
                type: "bar",
                label: type,
                data: Object.values(dataForChart).map((user) => user[type] || 0),
                backgroundColor: pickRandomColorFromColorScheme(),
                maxBarThickness: 100,
            }
        })
    };
    return <Chart data={data} type={"bar"} height={150} options={options}/>
}




function UserGraph() {
    const [date,setDate] = useState(formatDateWithZeros(new Date()));
    let individualData = useUpdates("/api/views/individualView",{date});

    const theme = useContext(ThemeContext);

    function handleDateChange(e) {
        setDate(e.target.value);
    }
    if(individualData.length === 0)return(
        <Container className={"text-center"}>
            <Form.Control className={"mb-5"} value={date} onChange={handleDateChange} type="date" />
            Loading...
        </Container>
    );
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
                <Row>
                    <Col sm={12} className={`p-1 themed-drop-shadow ${theme}`} style={{border:`1px ${theme === "dark" ? "white" : "black" } solid`}}>
                        {individualData.length > 0 && <YearlyChart theme={theme} individualData={individualData} date={date} />}
                    </Col>
                </Row>
            </Container>
        </main>
    )
}

export default UserGraph;