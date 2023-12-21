import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import {colorScheme} from "../../_app";

import {lastDayOfMonth, setDate} from "date-fns";
import {useMantineColorScheme} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {MonthPickerInput} from "@mantine/dates";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useEvents from "../../../modules/hooks/useEvents";

const parseTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;

const dateSet = setDate


function MonthlyApprovalsChart({approvals,theme,events}){
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

    let totalData = dateArr.reduce((acc,cur)=>{
        if(!acc[cur]) acc[cur] = 0;
        approvals.forEach((approval)=>{
            if(approval.date_of_final_approval === cur){
                acc[cur] += +approval.count;
            }
        })
        return acc;
    },{});
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
        },
        scales:{
            y:{
                max:Math.ceil(Math.max(...max)*3),
            },
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
                type:"line",

            }
        ]
    };
    console.log(events)
    return (
        <BaseChart events={events} data={data} height={150} config={options} />
    )
}

const MonthlyView = () => {
    useUsage("Metrics","Approvals-Monthly-chart")
    const [date,setDate] = useState(dateSet(new Date(),1))
    const {colorScheme:theme} = useMantineColorScheme();
    let approvals = useUpdates("/api/views/approvals", {date, interval: "1 month",increment:"day"});
    approvals = approvals.map((approval) => ({...approval, date_of_final_approval: approval.date_of_final_approval.split("T")[0]}));

    const {reducedEvents} = useEvents({
        startDate:date,
        endDate:lastDayOfMonth(date),
        timeScale:'day',
        includedCategories:['Processing','Warehouse'],
        affected_categories:['Processing'],
    })

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

            <MonthlyApprovalsChart
                events={reducedEvents(approvals.map(({date_of_final_approval})=>date_of_final_approval))}
                approvals={approvals}
                theme={theme}
            />
        </GraphWithStatCard>

    );
};

export default MonthlyView;