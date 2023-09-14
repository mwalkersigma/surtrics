import React, {useContext, useState} from 'react';
import Form from "react-bootstrap/Form";
import useUpdates from "../../modules/hooks/useUpdates";
import {ThemeContext} from "../layout";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import InfoCard from "../../components/infoCards/infocard";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Title,
    Tooltip
} from "chart.js";
import {Line} from "react-chartjs-2";
import formatter from "../../modules/utils/numberFormatter";
import DataLabels from "chartjs-plugin-datalabels";



ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    DataLabels
);




function LineGraphMonthly ({monthData,theme}) {
    theme = theme === "dark" ? "#FFF" : "#000";
    console.log(theme)
    const options = {
        responsive: true,
        plugins: {
            datalabels: {
                color: theme,
                display: (context) => context.dataset.data[context.dataIndex] > 0,
                formatter: Math.round
            },
            legend: {
                position: 'top',
                color: theme,
                labels:{
                    color: theme + "A",
                }
            },
            title: {
                display: true,
                text: 'Surplus Metrics Monthly View',
                color: theme,
                font: {
                    size: 30,
                }
            },
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
    const graphData = {
        labels: monthData.map(({day}) => day.split("T")[0]),
        datasets: [
            {
                label: "Increments",
                data: monthData.map(({transactions}) => +transactions),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            }
        ]
    }
    return (
        <Line data={graphData} height={150} title={"Monthly View"} options={options} />
    )
}
const MonthlyView = () => {
    const [date,setDate] = useState(formatDateWithZeros(new Date()))
    let monthData = useUpdates("/api/views/monthlyView",{date});
    const theme = useContext(ThemeContext)

    if(monthData.length === 0)return(
        <Container className={"text-center"}>
            <Form.Control className={"mb-5"} value={date} onChange={(e)=>setDate(e.target.value)} type="date" />
            Loading... ( If this takes more than 10 seconds, there is probably no data for this date )
        </Container>
    );
    let cardData = monthData.map(({transactions}) => +transactions);
    let margin = "3rem";
    return (
        <Container>
            <Form.Control
                className={"mb-3"}
                value={date}
                onChange={(e)=>setDate(e.target.value)}
                type="date"
            />
            <Row>
                <Col sm={10} style={{border:`1px ${theme === "dark" ? "white" : "black" } solid`}} >
                    <LineGraphMonthly monthData={monthData} theme={theme} />
                </Col>
                <Col sm={2}>
                    <InfoCard style={{marginBottom:margin}}  title={"Total"} theme={theme}>
                        {formatter(cardData.reduce((a,b) => a + b,0))}
                    </InfoCard>
                    <InfoCard style={{marginBottom:margin}} title={"Average"} theme={theme}>
                        {formatter(Math.round(cardData.reduce((a,b) => a + b,0) / monthData.length))}
                    </InfoCard>
                    <InfoCard style={{marginBottom:0}} title={"Best Day"} theme={theme}>
                        {formatter(cardData.reduce((a,b) => a > b ? a : b,0))}
                    </InfoCard>
                </Col>
            </Row>

        </Container>
    );
};




export default MonthlyView;