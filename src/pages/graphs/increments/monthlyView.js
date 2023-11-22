import React, {useState} from 'react';
import yymmddTommddyy from "../../../modules/utils/yymmddconverter";
import useUpdates from "../../../modules/hooks/useUpdates";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Title as chartTitle,
    Tooltip
} from "chart.js";
import {Line} from "react-chartjs-2";
import DataLabels from "chartjs-plugin-datalabels";
import {colorScheme} from "../../_app";
import {setDate} from "date-fns";
import {useMantineColorScheme} from "@mantine/core";
import {MonthPickerInput} from "@mantine/dates";
import StatsCard from "../../../components/mantine/StatsCard";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";



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




function LineGraphMonthly ({monthData,theme}) {
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
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
                borderColor: colorScheme.indigo,
                backgroundColor: colorScheme.indigo,
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
                borderColor: colorScheme.green,
                backgroundColor: colorScheme.green,
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
                borderColor: colorScheme.red,
                backgroundColor: colorScheme.red,
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
                borderColor: colorScheme.blue,
                backgroundColor: colorScheme.blue,
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
        <Line data={graphData} height={150} title={"Monthly View"} options={options} />
    )
}
const dateSet = setDate;
const MonthlyView = () => {

    const [date,setDate] = useState(dateSet(new Date(),1))
    let monthData = useUpdates("/api/views/increments",{date,interval:"1 month",increment:"day"});
    const {colorScheme:theme} = useMantineColorScheme();


    // group by date
    // add a total field
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
                    <StatsCard
                        key={0}
                        stat={{
                            title: "Total Increments",
                            value: (cardData.reduce((a, {total}) => a + total, 0)),
                        }}/>,
                    <StatsCard
                        key={1}
                        stat={{
                            title: "Average Increments",
                            value: (Math.round(cardData.reduce((a, {total}) => a + total, 0) / cardData.length)),
                        }}/>,
                    <StatsCard
                        key={2}
                        stat={{
                            title: "Best Day ", value: (cardData.reduce((a, {total}) => a > total ? a : total, 0)),
                        }}/>,
                    <StatsCard
                        key={3}
                        stat={{
                            title: "New Inbound",
                            value: cardData.reduce((acc,cur)=>acc + ((+cur["Add"] || 0) + (+cur["Add on Receiving"] || 0)),0),
                        }}
                    />,
                    <StatsCard
                        key={4}
                        stat={{
                            title: "Re-listings",
                            value: cardData.reduce((acc,cur)=>acc + (+cur["Relisting"] || 0),0),
                        }}/>
                ]
            }
        >
            <LineGraphMonthly monthData={monthData} theme={theme}/>
        </GraphWithStatCard>
    )
};




export default MonthlyView;