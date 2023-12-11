import React from "react";
import useUpdates from "../../../modules/hooks/useUpdates";
import {subMonths} from "date-fns";
import {useMantineColorScheme,Center, Text} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {colorScheme} from "../../_app";
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
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUsage from "../../../modules/hooks/useUsage";

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

const EbayRangeView = () => {
    useUsage("Ecommerce","Ebay-RangeView-chart")
    const [dateRange, setDateRange] = React.useState([subMonths(new Date(),1), new Date()]) // [start, end]
    const [startDate,endDate] = dateRange;
    let {colorScheme:theme} = useMantineColorScheme();
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    let updates = useUpdates("/api/views/ebay",{startDate,endDate});
    updates = updates
        .map((update) => {
            delete update.user_who_entered;
            delete update.entry_id;
            return update;
        })
        .sort((a,b) => a.date_for_week - b.date_for_week )
        .map((update) =>({...update, date_for_week: new Date(update.date_for_week).toLocaleDateString()}))
        .reduce((acc,update)=>{
            Object.keys(update).forEach((key)=>{
                let color = colorScheme.random();
                if(!acc[key]) acc[key] = {
                    label: key,
                    data: [],
                    borderColor: color,
                    backgroundColor: color,
                };
                acc[key].data.push(update[key])
            })
            return acc;
        },{})
    const dates = updates?.date_for_week?.data;
    delete updates.date_for_week;

    const graphData = {
        labels: dates,
        datasets: Object.values(updates)
    }
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
            title={"Ebay Ecommerce Data"}
            dateInput={
                <CustomRangeMenu subscribe={setDateRange} defaultValue={dateRange}/>
            }
            slotTwo={
                <Center h={'100%'}>
                    <Text fz={'small'} c={'dimmed'}>
                        Please Keep in mind ALL data prior to december
                        1st was done on a weekly basis, and is currently
                        done on a daily basis
                    </Text>
                </Center>
            }
        >
            <Chart data={graphData} options={options} type={'line'}/>
        </GraphWithStatCard>
    );
};

export default EbayRangeView;