import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import makeDateArray from "../../../modules/utils/makeDateArray";
import {colorScheme} from "../../_app";
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";
import {addDays} from "date-fns";
import StatCard from "../../../components/mantine/StatCard";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";






let colorPalette = [
    colorScheme.blue,
    colorScheme.green,
    colorScheme.red,
    colorScheme.purple,
    colorScheme.yellow,
    colorScheme.orange,
    colorScheme.pink,
]






function WeeklyApprovalsChart({approvals,date}){
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
                callbacks :{
                    footer: (context) => {
                        return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }
            },
            title:{
                text:"Week View"
            }
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
                    stack: 1,
                    type:"bar"
                }
            })
    };
    return (
        <BaseChart data={data} config={options}/>
    )
}




const WeekView = () => {
    useUsage("Metrics","Approvals-Weekly-chart")
    const [date, setDate] = useState(new Date());
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
    return (<GraphWithStatCard
            title={"Surplus Template Approvals Weekly View"}
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
            <WeeklyApprovalsChart approvals={approvals} date={date} />
        </GraphWithStatCard>)
};

export default WeekView;