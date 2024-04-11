import React, {useState} from 'react';

import useUpdates from "../../../../modules/hooks/useUpdates";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Tooltip as tt
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {colorScheme} from "../../../_app";
import {eachMonthOfInterval, lastDayOfYear, setDate, setMonth} from "date-fns";
import {Slider, Text, Tooltip, useMantineColorScheme} from "@mantine/core";
import GraphWithStatCard from "../../../../components/mantine/graphWithStatCard";
import {YearPickerInput} from "@mantine/dates";
import StatCard from "../../../../components/mantine/StatCard";
import useUsage from "../../../../modules/hooks/useUsage";
import BaseChart from "../../../../components/Chart";
import useEvents from "../../../../modules/hooks/useEvents";
import useGoal from "../../../../modules/hooks/useGoal";
import {useDebouncedValue, useLogger} from "@mantine/hooks";
import smoothData from "../../../../modules/utils/graphUtils/smoothData";
import colorizeLine from "../../../../modules/utils/colorizeLine";
import formatter from "../../../../modules/utils/numberFormatter";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    tt,
    Legend,
    LineElement,
    DataLabels,
    PointElement,
);






function YearlyChart(props){
    let {yearData,theme,goals,resolution} = props;
    const useTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 4,
        plugins: {
            tooltip: {
                callbacks: {
                    footer: (context)=> {
                        return "TOTAL: " + context.filter((context)=>{
                            return context.dataset.label !== "Goal" && context.dataset.label !== "trend"
                        }).reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }
            },
            legend: {
                position: "top",
                align: "center",
                labels: {
                    boxWidth: 30,
                    usePointStyle: true,
                    color: useTheme(theme)+"A",
                },
            },
            datalabels: {
                color: colorScheme.white,
                display: (context) => context.dataset.data[context.dataIndex] > 200,
                font: {
                    weight: "bold",
                },
                formatter:(val) => formatter(val)
            },
        },
        scales: {
            y: {
                stacked: true,
                min: 0,
                max: 20000,
                ticks: {
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            },
            x:{
                stacked: true,
                ticks: {
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            }
        },
    }

    const months = [ "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


    yearData =  yearData
        .map((item)=>({...item, ...{date_of_transaction: item.date_of_transaction.split("T")[0]}}))
        .sort((a,b)=> new Date(a.date_of_transaction) - new Date(b.date_of_transaction));

    const goalsMapped = yearData.length > 0 && yearData
        .reduce((acc, {date_of_transaction}) => {
            if(acc.includes(date_of_transaction)) return acc;
            acc.push(date_of_transaction);
            return acc;
        },[])
        .map((date_of_transaction) => {
          let goal;
          for(let i = 0; i < goals.length; i++){
              let goalDate = new Date(goals[i].goal_date);
              let transactionDate = new Date(date_of_transaction);
                if(goalDate <= transactionDate && (!goal || goalDate > new Date(goal.goal_date))){
                    goal = goals[i];
                }

          }
            return goal;
        })

    let totals = Object.values(yearData
        .reduce((acc, {count,date_of_transaction}) =>{
            if(!acc[date_of_transaction]){
                acc[date_of_transaction]={count:0,date_of_transaction};
            }
            acc[date_of_transaction].count += +count;
            return acc;
        }, {}))
        .map(({count}) => count);

    const smooth = smoothData(totals,resolution);
    const data = yearData.length > 0 && {
        labels: months,
        datasets: [
            {
                type: "bar",
                label: "New Inbound",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add on Receiving").map(({count}) => (+count)),
                borderRadius: 5,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Incrementation",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Add").map(({count}) => (+count)),
                borderRadius: 5,
                stack: "stack0"
            },
            {
                type: "bar",
                label: "Relisting",
                data: yearData?.filter(({transaction_reason})=>transaction_reason === "Relisting").map(({count}) => (+count)),
                borderRadius: 5,
                stack: "stack0"
            },
            {
                type: "line",
                label: "Goal",
                data: goalsMapped.filter(item=>item).map(({goal_amount}) => Number(goal_amount) * 4.5 ),
                borderWidth: 2,
                stack: "stack1"
            },
            {
                type: "line",
                label: "trend",
                data: smooth,
                segment: {
                    borderColor: colorizeLine({up:'limeGreen',down:'red',unchanged:'blue'})
                },
                borderWidth: 2,
                stack: "stack2",
            }
        ]
    };



    return <BaseChart customColors stacked events={props.events} data={data} config={options}/>
}



let dateSet = setDate
function Index() {
    useUsage("Metrics","Increments-yearly-chart")
    const [date,setDate] = useState(dateSet(setMonth(new Date(),0),1));
    const goal = useGoal({all:true});
    let yearData = useUpdates("/api/views/increments",{date,interval:"1 year",increment:"month"});
    const [resolution, setResolution] = useState(4);
    const [debounced] = useDebouncedValue(resolution, 500);
    useLogger("Sales Vs Purchases: Trend Line Resolution Factor",[debounced])
    const {colorScheme:theme} = useMantineColorScheme();


    const cardData = Object.values(yearData.reduce((acc, {count,date_of_transaction,transaction_reason}) =>{
        if(!acc[date_of_transaction]){
            acc[date_of_transaction]={count:0,date_of_transaction,[transaction_reason]:count};
        }
        else{
            acc[date_of_transaction][transaction_reason] = count;
        }
        acc[date_of_transaction].count += +count;
        return acc;
    } , {}));

    const {reducedEvents} = useEvents({
        startDate:date,
        endDate:lastDayOfYear(date),
        timeScale:'month',
        includedCategories:['Processing'],
        affected_categories:['Processing']
    })
    return (
        <GraphWithStatCard
            title={"Surplus Increments Yearly View"}
            dateInput={
                <YearPickerInput
                    mb={"xl"}
                    label={"Year"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            slotTwo={
                <Tooltip label={"The higher the resolution, the smoother the trend line."}>
                    <span>
                        <Text ml={"xs"} >Trend Line Resolution</Text>
                        <Slider
                            mb={"xl"}
                            ml={"xs"}
                            color="blue"
                            marks={[
                                { value: 0, label: 'none' },
                                { value: 2, label: '2' },
                                { value: 4, label: '4' },
                                { value: 6, label: '6' },
                                { value: 8, label: 'linear' },
                            ]}
                            min={0}
                            max={8}
                            value={resolution}
                            onChange={(e) => setResolution(e)}
                        />
                    </span>
                </Tooltip>
            }
            isLoading={yearData.length === 0}
            cards={
            [
                <StatCard
                    key={0}
                    stat={{
                        title: "Total Increments",
                        value: (cardData.reduce((a, {count}) => a + count, 0)),
                    }}
                />,
                <StatCard
                    key={1}
                    stat={{
                        title: "Average Increments",
                        value: (Math.round(cardData.reduce((a, {count}) => a + count, 0) / cardData.length)),
                    }}
                />,
                <StatCard
                    key={2}
                    stat={{
                        title: "Best Month",
                        value: (cardData.reduce((a, {count}) => a > count ? a : count, 0)),
                    }}
                />,
                <StatCard
                    key={3}
                    stat={{
                        title: "New Inbound",
                        value: (yearData
                            .filter((item) => (item.transaction_reason === "Add on Receiving" || item.transaction_reason === "Add"))
                            .reduce((acc, {count}) => acc + +count, 0)),
                    }}
                />,
                <StatCard
                    key={4}
                    stat={{
                        title: "Re-listings",
                        value: (yearData
                            .filter((item) => (item.transaction_reason === "Relisting"))
                            .reduce((acc, {count}) => acc + +count, 0)),
                    }}
                />

            ]
        }
        >
            <YearlyChart
                resolution={debounced}
                goals={goal}
                events={reducedEvents(eachMonthOfInterval({start:date,end:lastDayOfYear(date)}))}
                theme={theme}
                yearData={yearData}
                date={date}
            />
        </GraphWithStatCard>)
}

export default Index;