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
import findStartOfWeek from "../../modules/utils/findMondayFromDate";
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






function YearlyChart(props){
    let {yearData,theme} = props;
    const useTheme = theme => theme === "dark" ? "#FFF" : "#000";

    const options = {
        plugins: {
            legend: {
                position: "top",
                align: "center",
                labels: {
                    boxWidth: 30,
                    usePointStyle: true,
                    color: useTheme(theme)+"A",
                },
                title: {
                    text: "Year View",
                    display: true,
                    color: useTheme(theme),
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
                ticks: {
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            },
            x:{
                ticks: {
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            }
        },
    }

    const monthes = [ "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const data = yearData.length > 0 && {
        labels: yearData?.map(({month}) => (monthes[month-1])),
        datasets: [
            {
                type: "bar",
                label: "Days",
                data: yearData?.map(({transactions}) => (+transactions)),
                backgroundColor: "#04570d",
                barThickness: 75,
                borderRadius: 10
            }
        ]
    };
    return <Chart data={data} type={"bar"} height={150} options={options}/>
}




function YearlyView() {
    const [date,setDate] = useState(formatDateWithZeros(new Date()));
    let yearData = useUpdates("/api/views/yearlyView",{date});

    const theme = useContext(ThemeContext);

    function handleDateChange(e) {
        setDate(e.target.value);
    }
    if(yearData.length === 0)return(
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
                <Row>
                    <Col sm={10} className={`p-1 themed-drop-shadow ${theme}`} style={{border:`1px ${theme === "dark" ? "white" : "black" } solid`}}>
                        {yearData.length > 0 && <YearlyChart theme={theme} yearData={yearData} date={date} />}
                    </Col>
                    <Col sm={2}>
                        <InfoCard style={{marginBottom:margin}} title={"Total Increments"} theme={theme}>
                            {
                                formatter(yearData.reduce((acc, {transactions}) => (acc + +transactions), 0))
                            }
                        </InfoCard>
                        <InfoCard style={{marginBottom:margin}} title={"Average Increments"} theme={theme}>
                            {
                                formatter(Math.round(yearData.reduce((acc, {transactions}) => (acc + +transactions), 0) / yearData.length))
                            }
                        </InfoCard>
                        <InfoCard style={{marginBottom:0}} title={"Best Month"} theme={theme}>
                            {
                                formatter(yearData.reduce((acc, {transactions}) => (acc > +transactions ? acc : +transactions), 0))
                            }
                        </InfoCard>
                    </Col>
                </Row>
            </Container>
        </main>
    )
}

export default YearlyView;