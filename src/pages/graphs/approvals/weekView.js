import React, {useContext, useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import {ThemeContext} from "../../layout";
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
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import {useMantineColorScheme} from "@mantine/core/lib";




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
    colorScheme.purple,
    colorScheme.yellow,
    colorScheme.orange,
    colorScheme.pink,
]


const parseTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;
const WeekView = () => {
    const [date, setDate] = useState(formatDateWithZeros(findStartOfWeek(new Date())));

    const {colorScheme:theme} = useMantineColorScheme();

    let approvals = useUpdates("/api/views/approvals", {date,interval:"1 week"});

    if(!approvals){
        return ( <Container>
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
        </Container>)
    }

    const names = [...new Set(approvals.map(({name}) => name))];
    const dateArr = makeDateArray(date);

    approvals = approvals.map((approval) =>{
        return {
            date_of_final_approval:approval.date_of_final_approval.split("T")[0],
            name:approval.name,
            count:approval.count
        }
    });
    names.forEach((name) => {
        let possibleApprovals =
            approvals
                .filter((approval) => approval.name === name)
                .map(({transactionDate})=>transactionDate)
        dateArr.forEach((date) => {
            const found = possibleApprovals.find((approvalDate) => approvalDate === date);
            if(!found){
                approvals.push({name,date_of_final_approval:date,count:null})
            }
        })
    })

    const dataForGraph = names.reduce((acc,cur)=>{
        if(!acc[cur]) acc[cur] = [];
        let possibleApprovals =
            approvals
                .filter((approval) => approval.name === cur)
        dateArr.forEach((date) => {
            const found = possibleApprovals.find((approvalDate) => approvalDate.date_of_final_approval === date);
            acc[cur].push(found.count)
        })
        return acc
    },{})
    const max = Object
        .values(dataForGraph)
        .map(arr=>arr.map(item=>+item))
        .reduce((acc,cur)=>{
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
        datasets:Object.entries(dataForGraph)
            .map(([name,graphData],i) => {
                return {
                    label: name,
                    data:graphData,
                    backgroundColor: colorPalette[i%colorPalette.length],
                    borderColor: colorPalette[i%colorPalette.length],
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
                        onChange={(e)=>setDate(formatDateWithZeros(findStartOfWeek(new Date(e.target.value))))}
                        type="date"
                    />
                </Row>
                <Chart data={data} type={"bar"} height={150} options={options}/>
            </Container>
    );
};

export default WeekView;