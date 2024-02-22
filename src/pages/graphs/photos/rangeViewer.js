import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useEvents from "../../../modules/hooks/useEvents";
import {colorScheme} from "../../_app";
import formatter from "../../../modules/utils/numberFormatter";
import BaseChart from "../../../components/Chart";
import {useMantineColorScheme} from "@mantine/core";
import StatCard from "../../../components/mantine/StatCard";

const RangeViewer = () => {
    const {colorScheme:theme} = useMantineColorScheme();
    const useTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;
    const [[startDate,endDate],setDate] = useState([new Date("2024-01-01"),new Date("2024-01-31")])

    const updates = useUpdates("/api/views/photos",{ startDate, endDate })

    const {reducedEvents} = useEvents({
        startDate,
        endDate,
        timeScale:'day',
        includedCategories:['Processing'],
        affected_categories:['Processing']
    })
    const users = [...new Set(updates.map(event => event['image_last_updated_by']))]

    const dates = [...new Set(updates.map(event => event['image_last_updated_utc']))]
    dates.sort((a,b)=>new Date(a) - new Date(b))

    const countByDateByUser = updates.reduce((acc,update)=>{

        const {image_last_updated_by, image_last_updated_utc, count} = update

        if(!acc[image_last_updated_utc]){
            acc[image_last_updated_utc] = {}
        }

        if (!acc[image_last_updated_utc][image_last_updated_by]){
            acc[image_last_updated_utc][image_last_updated_by] = 0
        }

        acc[image_last_updated_utc][image_last_updated_by] += Number(count)

        return acc

    },{})

    const dataSets = users.map(user=>{
        return {
            label:user,
            type:'bar',
            data:dates.map(date=>{
                return countByDateByUser[date][user] || 0
            }),
            stack: 'Stack 0',
        }
    })

    const options = {
        plugins: {
            legend: {
                position: "top",
                align: "center",
                labels: {
                    boxWidth: 30,
                    usePointStyle: true,
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
                    callback:(value)=>`${new Date(dates[value]).toLocaleDateString()}`,
                    color: useTheme(theme)+"A"
                },
                grid: {
                    color: useTheme(theme)+"3"
                }
            }
        },
    };

    return (
        <GraphWithStatCard
            title={"Photos Credits Range Viewer"}
            cards={[
                {
                    title:"Total Credits",
                    value:updates.reduce((acc,update)=>acc+Number(update.count),0),
                },
                {
                    title:"Estimated Photos",
                    value:updates.reduce((acc,update)=>acc+Number(update.count),0) * 3,
                },
                {
                    title:"Total Users",
                    value:users.length,
                },
                {
                    title:"Total Dates",
                    value:dates.length,
                }
            ].map((stat,i)=><StatCard key={i} stat={stat}/>)}
            dateInput={
                <CustomRangeMenu
                    mb={"xl"}
                    subscribe={setDate}
                    label={"Date Range"}
                    defaultValue={[startDate,endDate]}
                />
            }

        >
            <BaseChart type={"bar"} stacked events={reducedEvents(dates)} data={{labels:dates, datasets:dataSets}} config={options}/>
        </GraphWithStatCard>
    );
};

export default RangeViewer;