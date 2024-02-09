import React, {useState} from 'react';
import yymmddTommddyy from "../../../modules/utils/yymmddconverter";
import useUpdates from "../../../modules/hooks/useUpdates";

import {colorScheme} from "../../_app";
import {lastDayOfMonth, setDate} from "date-fns";
import {useMantineColorScheme} from "@mantine/core";
import {MonthPickerInput} from "@mantine/dates";
import StatCard from "../../../components/mantine/StatCard";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useEvents from "../../../modules/hooks/useEvents";
import useGoal from "../../../modules/hooks/useGoal";








function LineGraphMonthly ({monthData,theme,events,goal}) {
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    const options = {
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
            annotation: {
                annotations: [
                    {
                        type: 'line',
                        borderColor: 'red',
                        borderWidth: 2,
                        label: {
                            display: true,
                            content: "Increment Goal",
                            backgroundColor: 'red',
                            color: 'white',
                            rotation: 'auto'
                        },
                        value: () => goal ?? 0,
                        scaleID: 'y',
                    }
                ]
            }
        }
    };
    const dataSets = monthData.reduce((acc,curr)=>{
        let date = curr.date_of_transaction.split("T")[0];
        if(!acc[date]){
            acc[date] = {
                day: date,
                total: +curr.count,
                [curr['transaction_reason']]: +curr.count
            }
            return acc;
        }
        acc[date].total += +curr.count;
        acc[date][curr['transaction_reason']] = +curr.count;
        return acc
    },{})
    const graphData = {
        labels: Array
            .from(new Set(monthData.map(({date_of_transaction}) => date_of_transaction.split("T")[0])))
            .map(yymmddTommddyy)
        ,
        datasets: [
            {
                label: "Total",
                data: Object.values(dataSets).map((item) => item["total"] ?? 0),
                type: "line",
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "Incrementation",
                data: Object.values(dataSets).map((item) => item["Add"] ?? 0),
                type: "line",
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "New Inbound",
                data: Object.values(dataSets).map((item) => item["Add on Receiving"] ?? 0),
                type: "line",
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "Relisting",
                data: Object.values(dataSets).map((item) => item["Relisting"] ?? 0),
                type: "line",
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            }
        ]
    }
    return (
        <BaseChart events={events(graphData.labels)} data={graphData} config={options} />
    )
}
const dateSet = setDate;
const MonthlyView = () => {
    useUsage("Metrics","MonthlyIncrementsView-chart")
    const [date,setDate] = useState(dateSet(new Date(),1))
    let monthData = useUpdates("/api/views/increments",{date,interval:"1 month",increment:"day"});
    const goal = useGoal({date})
    const {colorScheme:theme} = useMantineColorScheme();

    let cardData = monthData?.reduce((acc,curr)=>{
        let date = curr.date_of_transaction.split("T")[0];
        if(!acc[date]){
            acc[date] = {
                day: date,
                total: +curr.count,
                [curr['transaction_reason']]: +curr.count
            }
            return acc;
        }
        acc[date].total += +curr.count;
        acc[date][curr['transaction_reason']] = +curr.count;
        return acc
    },{})
    cardData = Object?.values(cardData);
    const {reducedEvents} = useEvents({
        startDate:date,
        endDate:lastDayOfMonth(date),
        timeScale:'day',
        includedCategories:['Processing'],
        affected_categories:['Processing'],
        minY:600,
    })
    return (
        <GraphWithStatCard
            title={"Surplus Increments Monthly View"}
            dateInput={
                <MonthPickerInput
                    mb={"xl"}
                    label={"Month"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            isLoading={monthData.length === 0}
            cards={
                [
                    <StatCard
                        key={0}
                        stat={{
                            title: "Total Increments",
                            value: (cardData.reduce((a, {total}) => a + total, 0)),
                        }}/>,
                    <StatCard
                        key={1}
                        stat={{
                            title: "Average Increments",
                            value: (Math.round(cardData.reduce((a, {total}) => a + total, 0) / cardData.length)),
                        }}/>,
                    <StatCard
                        key={2}
                        stat={{
                            title: "Best Day ", value: (cardData.reduce((a, {total}) => a > total ? a : total, 0)),
                        }}/>,
                    <StatCard
                        key={3}
                        stat={{
                            title: "New Inbound",
                            value: cardData.reduce((acc,cur)=>acc + ((+cur["Add"] || 0) + (+cur["Add on Receiving"] || 0)),0),
                        }}
                    />,
                    <StatCard
                        key={4}
                        stat={{
                            title: "Re-listings",
                            value: cardData.reduce((acc,cur)=>acc + (+cur["Relisting"] || 0),0),
                        }}/>
                ]
            }
        >
            <LineGraphMonthly goal={goal} events={reducedEvents} monthData={monthData} theme={theme}/>
        </GraphWithStatCard>
    )
};




export default MonthlyView;