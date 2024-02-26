import React from 'react';
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUpdates from "../../../modules/hooks/useUpdates";
import {NativeSelect, useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../_app";
import BaseChart from "../../../components/Chart";
import RoleWrapper from "../../../components/RoleWrapper";
import useUsage from "../../../modules/hooks/useUsage";
import StatCard from "../../../components/mantine/StatCard";
import {setDate, subDays} from "date-fns";

const parseTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;

const ResearchEntries = () => {
    useUsage("Metrics", "surprice-range-chart")
    const {colorScheme: theme} = useMantineColorScheme();
    const [interval, setInterval] = React.useState('day');
    const [[startDate,endDate], setDateRange] = React.useState([subDays(new Date(),30), new Date()]);
    const rows = useUpdates('/api/views/surpriceEntries',
        {
            startDate,
            endDate,
            interval
        });

    const days = rows.reduce((acc,curr)=>{
        acc.includes(curr.date) ? null : acc.push(curr.date);
        return acc
        }, []);

    const names = rows.reduce((acc,curr)=>{
        acc.includes(curr.approver) ? null : acc.push(curr.approver);
        return acc
        }, []);
    const bestDate = Math.max(...days
        .map(day=>rows.filter(row=>row.date === day))
        .map(arr=>arr.reduce((acc,curr)=>acc + +curr.count,0)));

    const colors = [0,1,3,5,6,7,8]
    let datasets = names.map((name,i)=>{
        return {
            label:name,
            data:days
                .map(day=>rows.find(row=>row.approver === name && row.date === day)?.count || 0)
                .map(num=>parseInt(num)),
            backgroundColor: colorScheme.byIndex(colors[i%colors.length]),
            borderColor: colorScheme.byIndex(colors[i%colors.length]),
            borderWidth: 1,
            stack: 1,
            type: "bar"
        }
    })

    const data = {
        labels: days.map(day=>new Date(day).toLocaleDateString()),
        datasets: datasets
    }

    const options = {
        plugins: {
            tooltip: {
                color: parseTheme(theme),
                callbacks: {
                    footer: (context) => {
                        return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }
            },
            datalabels: {
                color: parseTheme(theme),
            },
        },
        scales: {
            y: {

            }
        }
    }


    return (
        <RoleWrapper altRoles={['buying group']} >
        <GraphWithStatCard
            title={'Surprice Research Entries'}
            isLoading={!rows.length>0}
            dateInput={
                <CustomRangeMenu
                    label="Date Range"
                    subscribe={setDateRange}
                    defaultValue={[startDate,endDate]}
                    mb={'xl'}
                />
            }
            cards={[
                {title:'Total Entries', value:rows.reduce((acc,curr)=>acc + +curr.count,0)},
                {title:'Average Entries', value:(rows.reduce((acc,curr)=>acc + +curr.count,0)/rows.length).toFixed(2)},
                {title:`Best ${interval}`, value:bestDate},
            ].map((stat,i)=><StatCard key={i} stat={stat}/>)}
            slotTwo={
            <NativeSelect
                label={'Interval'}
                value={interval}
                onChange={(e)=>setInterval(e.target.value)}
                data={[
                    {label:'Day',value:'day'},
                    {label:'Week',value:'week'},
                    {label:'Month',value:'month'},
                ]}
            />
            }
        >
            <BaseChart stacked data={data} config={options}/>
        </GraphWithStatCard>
        </RoleWrapper>
    );
};

export default ResearchEntries;