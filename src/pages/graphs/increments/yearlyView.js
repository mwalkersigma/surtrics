import React, {useContext, useState} from 'react';
import Container from "react-bootstrap/Container";

import useUpdates from "../../../modules/hooks/useUpdates";
import {ThemeContext} from "../../layout";
import {Chart} from "react-chartjs-2";
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
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import Form from "react-bootstrap/Form";
import {Col, Row} from "react-bootstrap";
import InfoCard from "../../../components/infoCards/infocard";
import formatter from "../../../modules/utils/numberFormatter";
import {colorScheme} from "../../_app";

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
    const useTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
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
                    text: "Year View",
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

    const monthes = [ "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const data = yearData.length > 0 && {
        labels: Array.from(new Set(yearData?.map(({month}) => (monthes[month-1])))),
        datasets: [
            {
                type: "bar",
                label: "New Inbound",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add on Receiving").map(({transactions}) => (+transactions)),
                backgroundColor: colorScheme.red,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Incrementation",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add").map(({transactions}) => (+transactions)),
                backgroundColor: colorScheme.green,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Relisting",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Relisting").map(({transactions}) => (+transactions)),
                backgroundColor: colorScheme.blue,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0"
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
    const cardData = Object.values(yearData.reduce((acc, {transactions,month,transaction_reason}) =>{
        if(!acc[month]){
            acc[month]={transactions:0,month,[transaction_reason]:transactions};
        }
        else{
            acc[month][transaction_reason] = transactions;
        }
        acc[month].transactions += +transactions;
        return acc;
    } , {}));

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
                            {formatter(cardData.reduce((acc, {transactions}) => (acc + +transactions), 0))}
                        </InfoCard>
                        <InfoCard style={{marginBottom:margin}} title={"New Inbound"} theme={theme}>
                            {
                                formatter(cardData
                                    .filter((item) => (item["Add"] || item["Add on Receiving"]))
                                    .reduce((acc,item)=>acc + (+item["Add"] || 0) + (+item["Add on Receiving"] || 0),0)
                                )
                            }
                        </InfoCard>
                        <InfoCard style={{marginBottom:0}} title={"Re-listings"} theme={theme}>
                            {
                                formatter(
                                    cardData
                                        .filter((item) => (item["Relisting"]))
                                        .reduce((acc,item)=>acc + (+item["Relisting"] || 0),0)
                                )
                            }
                        </InfoCard>
                    </Col>
                </Row>
            </Container>
        </main>
    )
}

export default YearlyView;