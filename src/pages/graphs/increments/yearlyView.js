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
import {getMonth, setDate, setMonth} from "date-fns";

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
    yearData =  yearData.map((item)=>{
        const {date_of_transaction} = item;
        return{...item, ...{date_of_transaction: getMonth(new Date(date_of_transaction))+1}}
    }).sort((a,b)=>a.date_of_transaction - b.date_of_transaction)
    console.log(yearData)
    const data = yearData.length > 0 && {
        labels: Array.from(new Set(yearData?.map(({date_of_transaction}) => (monthes[date_of_transaction-1])))),
        datasets: [
            {
                type: "bar",
                label: "New Inbound",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add on Receiving").map(({count}) => (+count)),
                backgroundColor: colorScheme.red,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Incrementation",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add").map(({count}) => (+count)),
                backgroundColor: colorScheme.green,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Relisting",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Relisting").map(({count}) => (+count)),
                backgroundColor: colorScheme.blue,
                barThickness: 75,
                borderRadius: 10,
                stack: "stack0"
            }
        ]
    };
    return <Chart data={data} type={"bar"} height={150} options={options}/>
}



let dateSet = setDate
function YearlyView() {
    const [date,setDate] = useState(formatDateWithZeros(dateSet(setMonth(new Date(),0),1)));
    let yearData = useUpdates("/api/views/increments",{date,interval:"1 year",increment:"month"});
    console.log(yearData)
    const theme = useContext(ThemeContext);

    function handleDateChange(e) {
        setDate(formatDateWithZeros(dateSet(setMonth(new Date(),0),1)));
    }
    if(yearData.length === 0)return(
        <Container className={"text-center"}>
            <Form.Control className={"mb-5"} value={date} onChange={handleDateChange} type="date" />
            Loading...
        </Container>
    );
    let margin = "3.5rem";
    const cardData = Object.values(yearData.reduce((acc, {count,date_of_transaction,transaction_reason}) =>{
        if(!acc[date_of_transaction]){
            acc[date_of_transaction]={count:0,date_of_transaction,[transaction_reason]:count};
        }
        else{
            acc[date_of_transaction][transaction_reason] = count;
        }
        acc[date_of_transaction].count += +count;
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
                            {formatter(cardData.reduce((acc, {count}) => (acc + +count), 0))}
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