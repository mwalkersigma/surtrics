import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";

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
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import {useMantineColorScheme} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";
import {addDays} from "date-fns";
import StatCard from "../../../components/mantine/StatCard";




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



function WeeklyApprovalsChart({approvals,date,theme}){
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
        responsive:true,
        maintainAspectRatio:false,
        devicePixelRatio:4,
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
        <Chart data={data} type={"bar"} height={150} options={options}/>
    )
}




const WeekView = () => {
    const [date, setDate] = useState(new Date());
    const {colorScheme:theme} = useMantineColorScheme();
    let approvals = useUpdates("/api/views/approvals", {date:formatDateWithZeros(addDays(findStartOfWeek(new Date(date)),1)),interval:"1 week",increment:'day'});

    const users = [...new Set(approvals.map(({name}) => name))]
        .reduce((acc,cur)=>{
            acc[cur] = approvals.filter(({name})=>name===cur).reduce((acc,cur)=>acc+ +cur.count,0);
            return acc
        },{})
    const totalApprovals = approvals?.reduce((acc,cur)=>acc+ +cur.count,0);
    const averageApprovals = totalApprovals/approvals?.length;
    const bestDay = approvals?.reduce((acc,cur)=>{
        if(acc.count < +cur.count) return cur;
        return acc;
    },{count:0})
    console.log(bestDay)
    return (<GraphWithStatCard
            title={"Surplus Approvals Weekly View"}
            isLoading={approvals.length === 0}
            dateInput={
                <DatePickerInput
                    mt={"xl"}
                    mb={"xl"}
                    label={"Date"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            cards={
                [
                    <StatCard
                        key={0}
                        stat={{
                            title:"Total",
                            value:totalApprovals,
                            subtitle:"Approvals for the week"
                        }}
                    />,
                    <StatCard
                        key={1}
                        stat={{
                            title:"Average Approvals",
                            value:averageApprovals,
                            subtitle:"Per Person Per Day"
                        }}
                    />,
                    <StatCard
                        key={2}
                        stat={{
                            title:"Best Day",
                            value:bestDay.count,
                            subtitle:`${bestDay.name} - ${new Date(bestDay.date_of_final_approval).toLocaleDateString()}`
                        }}
                    />,

                    <StatCard
                        key={3}
                        stat={{
                            title:"Lister of the week",
                            value:Math.max(...Object.values(users)),
                            subtitle:Object.keys(users).find((key)=>users[key]===Math.max(...Object.values(users)))
                        }}
                    />,

                ]
            }
            >
            <WeeklyApprovalsChart approvals={approvals} date={date} theme={theme}/>
        </GraphWithStatCard>)
};

export default WeekView;