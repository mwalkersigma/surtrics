import React from "react";
import {subMonths} from "date-fns";
import {useMantineColorScheme, Text, Center} from "@mantine/core";
import {colorScheme} from "../../_app";
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";



const BigCommerceRangeView = () => {
    useUsage("Ecommerce","BigCommerce-RangeView-chart")
    const [dateRange, setDateRange] = React.useState([subMonths(new Date(),1), new Date()]) // [start, end]
    const [startDate,endDate] = dateRange;
    let {colorScheme:theme} = useMantineColorScheme();
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    let updates = useUpdates("/api/views/bigCommerce",{startDate,endDate});
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
                    type: 'line',
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


    };

    return (
        <GraphWithStatCard
            title={"Big Commerce Ecommerce Data"}
            dateInput={
                <CustomRangeMenu
                    defaultValue={dateRange}
                    subscribe={setDateRange}
                    mb={'md'}
                />
            }
            slotTwo={
            <Center mb={'md'} h={'100%'}>
                <Text fz={'small'} c={colorScheme.red}>
                    Please Keep in mind ALL data prior to november 27th was done on a weekly basis, and is currently
                    done on a daily basis
                </Text>
            </Center>
        }
        >
            <BaseChart data={graphData} stacked config={options}/>
            {/*<Chart data={graphData} options={options} type={'line'}/>*/}
        </GraphWithStatCard>
    )
};

export default BigCommerceRangeView;