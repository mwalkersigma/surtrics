import React, {useEffect, useState} from "react";
import useUpdates from "../../../modules/hooks/useUpdates";
import {subMonths} from "date-fns";
import {useMantineColorScheme, NativeSelect, MultiSelect} from "@mantine/core";

import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {colorScheme} from "../../_app";

import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useEvents from "../../../modules/hooks/useEvents";
import formatter from "../../../modules/utils/numberFormatter";
import StatCard from "../../../components/mantine/StatCard";


const EbayRangeView = () => {
    useUsage("Ecommerce","Ebay-RangeView-chart")
    const timeScales = ['Data Points','week','month','year']

    const [affectedCategories, setAffectedCategories] = useState([]);
    const [timeScale, setTimeScale] = useState('Data Points')

    const [dateRange, setDateRange] = useState([subMonths(new Date(),1), new Date()]);
    const [startDate,endDate] = dateRange;

    let updates = useUpdates("/api/views/ebay",{startDate,endDate,timeScale});

    let {categories, reducedEvents} = useEvents({
        startDate,
        endDate,
        affected_categories:affectedCategories,
        timeScale,
        excludedCategories:['Processing','Warehouse'],
        combined:false
    });

    useEffect(() => {
        if(affectedCategories.length > 0) return;
        setAffectedCategories(categories)
    }, [categories]);

    let {colorScheme:theme} = useMantineColorScheme();
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;


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
                if(!acc[key]) acc[key] = {
                    label: key,
                    data: [],
                    type: 'line',
                };
                acc[key].data.push(update[key])
            })
            return acc;
        },{});

    const dates = updates?.date_for_week?.data;
    delete updates.date_for_week;
    console.log(updates)
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
            title={"Ebay Ecommerce Data"}
            dateInput={
                <CustomRangeMenu
                    label={"Date Range"}
                    defaultValue={dateRange}
                    subscribe={setDateRange}
                    mb={'md'}
                />
            }
            slotOne={
                <NativeSelect
                    label={"Time Scale"}
                    value={timeScale}
                    onChange={(e) => setTimeScale(e.target.value)}
                    mb={'md'}
                    data={timeScales}
                />
            }
            slotTwo={
                <MultiSelect
                    clearable
                    label={"Events Affected Categories"}
                    data={categories}
                    onChange={(e) => setAffectedCategories(e)}
                    value={affectedCategories}
                    mb={'md'}
                />
            }
            cards={[
                {
                    title:"Impressions",
                    value:updates.impressions.data.reduce((acc,curr)=> Number(acc) + Number(curr),0),
                    subtitle:"avg Visits: " + formatter(updates?.impressions?.data?.reduce((acc,curr)=> Number(acc) + Number(curr),0) / updates?.impressions?.data?.length),
                    format:'number',
                },
                {
                    title:"Page Views",
                    value:updates['pageviews'].data.reduce((a,b) => Number(a) + Number(b),0),
                    format:'number',
                    subtitle: "avg shopped: " + formatter(updates?.['pageviews']?.data.reduce((a,b) => Number(a) + Number(b),0) / updates?.['pageviews']?.data.length)
                },
            ].map((card,index)=>(<StatCard key={index} stat={card}/>))}
        >
            <BaseChart events={reducedEvents(dates || [])} data={graphData} stacked config={options}/>
        </GraphWithStatCard>
    )
};

export default EbayRangeView;