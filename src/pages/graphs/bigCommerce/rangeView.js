import React, {useEffect, useState} from "react";
import {
    lastDayOfMonth,
    lastDayOfYear,
    setDate,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths,
    subYears
} from "date-fns";
import {useMantineColorScheme, Text, Center, MultiSelect, NativeSelect} from "@mantine/core";
import {colorScheme} from "../../_app";
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import {mergeAdvanced} from "object-merge-advanced";
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";

/*
[
        {
            // Indicates the type of annotation
            type: 'label',
            xMin: 1,
            xMax: 2,
            //yMin: 8000,
            //yMax: 8070,
            backgroundColor: 'rgba(255, 99, 132, 0.75)',
            content: ['Notable Event', '15% off sale for surplus']
        },
        {
            // Indicates the type of annotation
            type: 'label',
            xMin: 5,
            xMax: 6,
            backgroundColor: 'rgba(255, 99, 132, 0.75)',
            content: ['Notable Event', '15% off sale for surplus']
        }
    ]
*/

const BigCommerceRangeView = () => {
    useUsage("Ecommerce","BigCommerce-RangeView-chart")
    const [categories, setCategories] = useState([]);
    const [affectedCategories, setAffectedCategories] = useState([]);
    const timeScales = ['Data Points','week','month','year']
    const [timeScale, setTimeScale] = useState('Data Points')
    const [dateRange, setDateRange] = useState([subMonths(new Date(),1), new Date()]) // [start, end]
    const [startDate,endDate] = dateRange;
    let {colorScheme:theme} = useMantineColorScheme();
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    let updates = useUpdates("/api/views/bigCommerce",{startDate,endDate,timeScale});
    let events = useUpdates("/api/views/events",{startDate,endDate});
    console.log(updates);

    useEffect(() => {
        if(!events.length > 0) return;
        let categories = events.map((event) => event.affected_categories).flat();
        categories = [...new Set(categories)];
        setCategories(categories);
        setAffectedCategories(categories);
    },[events])


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

    //get the max amount for updates
    let max = 0;
    let count = 0;
    let iterations = 0;
    Object.values(updates).forEach((update) => {
        let updateMax = Math.max(...update.data);
        count++
        if(updateMax > max) max = updateMax;
    })


    let reducedEvents = events
        .sort((a,b) => new Date(a.event_date) - new Date(b.event_date))
        .reduce((acc,event) => {
        let date = new Date(event.event_date).toLocaleDateString();
        let isAffected = event.affected_categories.some((category) => affectedCategories.includes(category));
        if(!isAffected) return acc;
        let index = dates?.indexOf(date);
        if(index === -1) {
            // find the nearest match not greater than
            let closest = dates.reduce((acc,date) => {
                let date1 = new Date(date);
                let date2 = new Date(event.event_date);
                if(date1 > date2) return acc;
                if(acc === null) return date;
                if(date1 > new Date(acc)) return date;
                return acc;
                },null)
            index = dates.indexOf(closest);
            if(!index) return acc;
            date = closest;
        }
        let position = index + 1;

        if(!acc[date]) {
            iterations++;
            acc[date] = [
                {
                    type:'label',
                    xMin: index,
                    xMax: position,
                    yMin: max / count * (iterations + 1) ,
                    yMax: max / count * (iterations + 2),
                    color:'white',
                    backgroundColor: 'rgba(255, 99, 132,.55)',
                    content: ['Notable Event',event.event_name],
                },
                {
                    type:'line',
                    xMin: position-1,
                    xMax: position-1,
                    color:'white',
                    yMin: 0,
                    borderColor: 'rgba(255, 99, 132, 0.75)',
                }
            ];
            return acc;
        }
        acc[date][0].content.push(event.event_name);
        return acc;
    },{})
    reducedEvents = Object.values(reducedEvents).flat();

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
                    label={"Date Range"}
                    defaultValue={dateRange}
                    subscribe={setDateRange}
                    mb={'md'}
                    presets={[
                        {
                            title: "This Month",
                            value: [setDate(new Date(),1), new Date()]
                        },
                        {
                            title: "Last Month",
                            value: [startOfMonth(subMonths(new Date(),1)), lastDayOfMonth(subMonths(new Date(),1))]
                        },
                        {
                            title: "This Year",
                            value: [startOfYear(new Date()), new Date()]
                        },
                        {
                            title: "Last Year",
                            value: [startOfYear(subYears(new Date(),1)), lastDayOfYear(subYears(new Date(),1))]
                        },
                    ]}
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
        >
            <BaseChart events={reducedEvents} data={graphData} stacked config={options}/>

        </GraphWithStatCard>
    )
};

export default BigCommerceRangeView;