import React, {useContext, useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import { ThemeContext} from "../../layout";
import {Row} from "react-bootstrap";
import Form from "react-bootstrap/Form";

import {Chart} from "react-chartjs-2";
import makeDateArray from "../../../modules/utils/makeDateArray";

import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {colorScheme} from "../../_app";
import Container from "react-bootstrap/Container";




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
    colorScheme.blue,
    colorScheme.green,
    colorScheme.red,
]


const parseTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;
const WeeklyView = () => {
    const [date, setDate] = useState(formatDateWithZeros(new Date()));
    const theme = useContext(ThemeContext);
    let quantity = useUpdates("/api/views/quantity/weeklyViewTotalOnly", {date});
    console.log(quantity)
    if(quantity.length === 0) return (
        <Container>
            <h1 className={"text-center"}>Quantity Week View</h1>
            <Row>
                <Form.Control
                    className={"mb-3"}
                    value={date}
                    onChange={(e)=>setDate(e.target.value)}
                    type="date"
                />
            </Row>
            <h4 className={"text-center"}>
                No Data for the week found.
            </h4>
        </Container>
    );

    quantity = quantity.map((quantity) => ({...quantity, date: quantity.date.split("T")[0]}));

    const names = [...new Set(quantity.map(({name}) => name))];
    const dateArr = makeDateArray(date);


    names.forEach((name) => {
        dateArr.forEach((date) => {
            const found = quantity.find((quantity) => quantity.name === name && quantity.date === date);
            if(!found) quantity.push({name,date:date,sum:null})
        })
    })

    const dataForGraph = names.reduce((acc,cur)=>{
        if(!acc[cur]) acc[cur] = [];
        dateArr.forEach((date) => {
            const found = quantity.find((quantity) => quantity.name === cur && quantity.date === date);
            acc[cur].push(found?.sum)
        })
        return acc
    },{})



    let max = Object
        .values(dataForGraph)
        .map(arr=>arr.map(item=>+item))
        .reduce((acc,cur)=>{
            cur.forEach((item,i)=>{
                acc[i] += item;
            })
            return acc
        },[0,0,0,0,0,0,0])
    max = Math.ceil(Math.max(...max)*2)
    const options = {
        plugins:{
            tooltip:{
                color:parseTheme(theme),
                callbacks :{
                    footer: (context) => {
                        return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }

            },
            datalabels:{
                color:parseTheme(theme),
            },
            title:{
                text:"Week View"
            }
        },
        interaction:{
            intersect:false,
            mode:"index"
        },
        scales:{
            y:{
                max:max
            }
        }
    }
    const data = {
        labels: dateArr,
        datasets:Object.entries(dataForGraph).map(([name,graphData],i) => {
            return {
                label: name,
                data:graphData,
                backgroundColor: colorPalette[i%3],
                borderColor: colorPalette[i%3],
                borderWidth: 1,
                stack: 1
            }
        })
    };
    return (
        <Container>
            <h1 className={"text-center"}>Quantity Week View</h1>
            <Row>
                <Form.Control
                    className={"mb-3"}
                    value={date}
                    onChange={(e)=>setDate(e.target.value)}
                    type="date"
                />
            </Row>
            <Chart data={data} type={"bar"} height={150} options={options}/>
        </Container>
    );
};

export default WeeklyView;