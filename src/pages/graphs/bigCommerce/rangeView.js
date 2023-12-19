import React, {useEffect, useState} from "react";
import {
    subMonths,
} from "date-fns";
import {useMantineColorScheme, MultiSelect, NativeSelect} from "@mantine/core";
import {colorScheme} from "../../_app";
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";


const BigCommerceRangeView = () => {
    useUsage("Ecommerce","BigCommerce-RangeView-chart")
    const timeScales = ['Data Points','week','month','year']
    const [categories, setCategories] = useState([]);
    const [affectedCategories, setAffectedCategories] = useState([]);
    const [timeScale, setTimeScale] = useState('Data Points')
    const [dateRange, setDateRange] = useState([subMonths(new Date(),1), new Date()]);
    const [startDate,endDate] = dateRange;
    let updates = useUpdates("/api/views/bigCommerce",{startDate,endDate,timeScale});
    let events = useUpdates("/api/views/events",{startDate,endDate});

    useEffect(() => {
        if(!events.length > 0) return;
        if(categories.length > 0) return;
        let temp = events.map((event) => event.affected_categories).flat();
        temp = [...new Set(temp)];
        setCategories(temp);
        setAffectedCategories(temp);
    },[events,categories])



    let {colorScheme:theme} = useMantineColorScheme();
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    console.log(updates);



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
        },{});

    const dates = updates?.date_for_week?.data;

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