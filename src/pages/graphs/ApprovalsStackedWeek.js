import React, {useContext, useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import useUpdates from "../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import {SundayContext, ThemeContext} from "../layout";
import {Row} from "react-bootstrap";
import Form from "react-bootstrap/Form";

import {Chart} from "react-chartjs-2";
import makeDateArray from "../../modules/utils/makeDateArray";

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
import {colorScheme} from "../_app";
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
const ApprovalsStackedWeek = () => {
    const [date, setDate] = useState(formatDateWithZeros(new Date()));
    const theme = useContext(ThemeContext);
    let approvals = useUpdates("/api/views/approvals/weeklyView", {date});

    if(approvals.length === 0) return (
            <Container>
                <h1 className={"text-center"}>Approvals View</h1>
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

    approvals = approvals.map((approval) => ({...approval, date_of_final_approval: approval.date_of_final_approval.split("T")[0]}));

    const names = [...new Set(approvals.map(({name}) => name))];
    const dateArr = makeDateArray(date);


    names.forEach((name) => {
        dateArr.forEach((date) => {
            const found = approvals.find((approval) => approval.name === name && approval.date_of_final_approval === date);
            if(!found) approvals.push({name,date_of_final_approval:date,count:null})
        })
    })

    const dataForGraph = names.reduce((acc,cur)=>{
        if(!acc[cur]) acc[cur] = [];
        dateArr.forEach((date) => {
            const found = approvals.find((approval) => approval.name === cur && approval.date_of_final_approval === date);
            acc[cur].push(found.count)
        })
        return acc
    },{})


    const max = Object
        .values(dataForGraph)
        .map(arr=>arr.map(item=>+item))
        .reduce((acc,cur,currentIndex)=>{
            cur.forEach((item,i)=>{
              acc[i] += item;
            })
            return acc
        },[0,0,0,0,0,0,0])

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
                max:Math.ceil(Math.max(...max)*1.5)
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
                <h1 className={"text-center"}>Approvals View</h1>
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

export default ApprovalsStackedWeek;