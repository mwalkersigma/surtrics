import React, {useContext, useState} from 'react';
import Form from "react-bootstrap/Form";
import useUpdates from "../../../modules/hooks/useUpdates";
import {ThemeContext} from "../../layout";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import InfoCard from "../../../components/infoCards/infocard";
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
import formatter from "../../../modules/utils/numberFormatter";
import DataLabels from "chartjs-plugin-datalabels";
import {colorScheme} from "../../_app";
import yymmddTommddyy from "../../../modules/utils/yymmddconverter";



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
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    const options = {
        devicePixelRatio: 4,
        responsive: true,
        plugins: {
            datalabels: {
                color: theme,
                formatter: Math.round,
                display: (context) => context.dataset.data[context.dataIndex] > 10 ? "auto" : false,
                backgroundColor:()=> theme === colorScheme.white ? false : colorScheme.white,
                borderRadius: 10,
            },
            legend: {
                position: 'top',
                color: theme,
                labels:{
                    color: theme + "A",
                    borderRadius: 10,
                    usePointStyle: true,
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
        interaction: {
            mode: 'index',
            intersect: false,
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
    const dataSets = monthData.reduce((acc,curr)=>{
        let date = curr.day.split("T")[0];
        if(!acc[date]){
            acc[date] = {
                day: date,
                total: +curr.transactions,
                [curr['transaction_reason']]: +curr.transactions
            }
            return acc;
        }
        acc[date].total += +curr.transactions;
        acc[date][curr['transaction_reason']] = +curr.transactions;
        return acc
    },{})


    const graphData = {
        labels: Array
            .from(new Set(monthData.map(({day}) => day.split("T")[0])))
            .map(yymmddTommddyy)
        ,
        datasets: [
            {
                label: "Total",
                data: Object.values(dataSets).map((item) => item["total"] ?? 0),
                borderColor: colorScheme.indigo,
                backgroundColor: colorScheme.indigo,
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "Incrementation",
                data: Object.values(dataSets).map((item) => item["Add"] ?? 0),
                borderColor: colorScheme.green,
                backgroundColor: colorScheme.green,
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "New Inbound",
                data: Object.values(dataSets).map((item) => item["Add on Receiving"] ?? 0),
                borderColor: colorScheme.red,
                backgroundColor: colorScheme.red,
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "Relisting",
                data: Object.values(dataSets).map((item) => item["Relisting"] ?? 0),
                borderColor: colorScheme.blue,
                backgroundColor: colorScheme.blue,
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
                    <InfoCard style={{marginBottom:margin}}  title={"Total Increments"} theme={theme}>
                        {formatter(cardData.reduce((a,b) => a + b,0))}
                    </InfoCard>
                    <InfoCard style={{marginBottom:margin}} title={"New Inbound"} theme={theme}>
                        {
                            formatter(monthData
                                .filter((item) => (item.transaction_reason === "Add on Receiving" || item.transaction_reason === "Add"))
                                .reduce((acc, {transactions})=>acc + +transactions ,0)
                            )
                        }
                    </InfoCard>
                    <InfoCard style={{marginBottom:0}} title={"Re-listings"} theme={theme}>
                        {
                            formatter(monthData
                                .filter((item) => (item.transaction_reason === "Relisting"))
                                .reduce((acc, {transactions})=>acc + +transactions ,0)
                            )
                        }
                    </InfoCard>
                </Col>
            </Row>

        </Container>
    );
};




export default MonthlyView;