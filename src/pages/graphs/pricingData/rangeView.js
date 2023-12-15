import React, { useState} from 'react';

import {subMonths} from "date-fns";

import {NativeSelect, useMantineColorScheme} from "@mantine/core";
import {Chart} from "react-chartjs-2";

import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Title as chartTitle,
    Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {colorScheme} from "../../_app";
import useUsage from "../../../modules/hooks/useUsage";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import StatCard from "../../../components/mantine/StatCard";


ChartJS.register(
    CategoryScale,
    LinearScale,
    chartTitle,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    DataLabels
);

const RangeView = () => {
    useUsage("test","test");
    let {colorScheme:theme} = useMantineColorScheme();
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    const [user,setUser] = useState("Total")
    const [dateRange, setDateRange] = React.useState([subMonths(new Date(),1), new Date()])
    const pricingData = useUpdates('/api/views/pricingData', {startDate: dateRange[0], endDate: dateRange[1]});
    let users = ['Total']
    pricingData.forEach(item=>{
        let username = item['user_who_priced'];
        if(users.includes(username)){
            return;
        }
        users.push(username)
    })

    let graphData = pricingData
        .map(update=>({...update, date_priced: new Date(update.date_priced).toLocaleDateString()}))
        .reduce((acc,curr)=>{

            if(!acc[curr['user_who_priced']]){
                acc[curr['user_who_priced']] = {}
            }
            if(!acc[curr['user_who_priced']][curr['date_priced']]){
                acc[curr['user_who_priced']][curr['date_priced']] = 0
            }
            if(!acc.Total[curr['date_priced']]){
                acc.Total[curr['date_priced']] = 0
            }
            acc[curr['user_who_priced']][curr['date_priced']]+=1
            acc.Total[curr['date_priced']] += 1
            return acc
        },{Total:{}})

    let chartData = graphData[user]
    chartData = Object.entries(chartData)
        .sort((a,b)=>new Date(a[0]) - new Date(b[0]))

    let labels = chartData.map(item=>item[0])
    let values = chartData.map(item=>item[1])

    const options = {
        devicePixelRatio: 4,
        responsive: true,
        maintainAspectRatio: false,
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
    return (
        <GraphWithStatCard
            isLoading={pricingData.length === 0}
            title={'Pricing Data'}
            dateInput={
                <CustomRangeMenu
                    subscribe={setDateRange}
                    defaultValue={dateRange}
                    mb={'xl'}
                    mt={'xl'}
                />
            }
            slotTwo={
                <NativeSelect
                    mb={'xl'}
                    mt={'xl'}
                    onChange={(e)=>setUser(e.currentTarget.value)}
                    value={user}
                    data={users}
                />
            }
            cards={[
                <StatCard
                    key={0}
                    stat={{
                        title: "Total Items Priced",
                        value: values.reduce((acc,curr)=>acc+curr,0),
                        subtitle:'Over the selected date range'
                    }}

                />,
                <StatCard
                    key={1}
                    stat={{
                        title: "Average Items Priced",
                        value: Math.round(values.reduce((acc,curr)=>acc+curr,0)/values.length),
                        subtitle:'Over the selected date range'
                    }}
                />,
                <StatCard
                    key={2}
                    stat={{
                        title: "Best Day",
                        value: Math.max(...values),
                        subtitle:'Over the selected date range'
                    }}
                />,
            ]}
        >
            <Chart data={{labels,datasets:[{label:"Pricing Data",data:values,borderColor:colorScheme.blue,backgroundColor:colorScheme.blue}]}} options={options} type={'line'}/>
        </GraphWithStatCard>
    );
};

export default RangeView;