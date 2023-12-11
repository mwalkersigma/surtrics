import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import {colorScheme} from "../../_app";
import {Chart} from "react-chartjs-2";

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
import {setDate} from "date-fns";
import {useMantineColorScheme} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {MonthPickerInput} from "@mantine/dates";
import useUsage from "../../../modules/hooks/useUsage";

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


const parseTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;
let colorPalette = [
    colorScheme.blue,
    colorScheme.green,
    colorScheme.red,
]
const dateSet = setDate


function MonthlyApprovalsChart({approvals,theme}){
    const names = [...new Set(approvals.map(({name}) => name))];
    let dateArr = approvals
        .map((approval) => approval.date_of_final_approval.split("T")[0])
        .sort((a,b) => {
            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        })
    dateArr = [...new Set(dateArr)]


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
        .reduce((acc,cur)=>{
            cur.forEach((item,i)=>{
                acc[i] += item;
            })
            return acc
        },Array(dateArr.length).fill(0))

    let stackedData = Object.entries(dataForGraph).map(([name,graphData],i) => {
        return {
            label: name,
            data:graphData,
            backgroundColor: colorPalette[i%3],
            borderColor: colorPalette[i%3],
            borderWidth: 1,
            stack: 1
        }
    });
    let totalData = dateArr.reduce((acc,cur)=>{
        if(!acc[cur]) acc[cur] = 0;
        approvals.forEach((approval)=>{
            if(approval.date_of_final_approval === cur){
                acc[cur] += +approval.count;
            }
        })
        return acc;
    },{});
    console.log(theme)
    const options = {
        devicePixelRatio: 4,
        responsive: true,
        maintainAspectRatio: false,
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
        },
        interaction:{
            intersect:false,
            mode:"index"
        },
        scales:{
            y:{
                max:Math.ceil(Math.max(...max)*3),
                ticks: {
                    color: parseTheme(theme) + "3"
                },
                grid: {
                    color: parseTheme(theme) + "3"
                }
            },
            x:{
                ticks: {
                    color: parseTheme(theme) + "3"
                },
                grid: {
                    color: parseTheme(theme) + "3"
                }
            }
        }
    }
    const data = {
        labels: dateArr,
        datasets:[
            {
                label: "Total",
                data:Object.values(totalData),
                backgroundColor: colorScheme.green,
                borderColor: colorScheme.green,
                borderWidth: 5,
                tension: 0.1,
                stack: 1,
                type:"line"
            }
        ]
    };
    return (
        <Chart data={data} height={150} options={options}/>
    )
}

const MonthlyView = () => {
    useUsage("Metrics","Approvals-Monthly-chart")
    const [date,setDate] = useState(dateSet(new Date(),1))
    const {colorScheme:theme} = useMantineColorScheme();
    let approvals = useUpdates("/api/views/approvals", {date, interval: "1 month",increment:"day"});
    approvals = approvals.map((approval) => ({...approval, date_of_final_approval: approval.date_of_final_approval.split("T")[0]}));



    return (
        <GraphWithStatCard
            title={"Surplus Template Approvals Monthly View"}
            isLoading={approvals.length === 0}
            dateInput={
                <MonthPickerInput
                    mt={"xl"}
                    mb={"xl"}
                    label={"Month"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            cards={[]}
        >
            <MonthlyApprovalsChart approvals={approvals} theme={theme}/>
        </GraphWithStatCard>

    );
};

export default MonthlyView;