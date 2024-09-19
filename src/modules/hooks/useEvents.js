import {useEffect, useState} from "react";
import useUpdates from "./useUpdates";

function findNearestIndex(array, value) {
    let nearestDate = array.reduce((acc,date) => {
        let date1 = new Date(date);
        let date2 = new Date(value);
        if(date1 > date2) return acc;
        if(acc === null) return date;
        if(date1 > new Date(acc)) return date;
        return acc;
    },0)
    return array.indexOf(nearestDate)
}





function select() {
    return true;
}

function yValue(ctx, label,combined = true) {
    const chart = ctx.chart;
    const dataset = chart.data.datasets[0];


    let combinedDataSet = []
    chart.data.datasets.forEach((dataset) => {
        let lowerCaseLabel = dataset['label']?.toLowerCase();
        if(lowerCaseLabel === 'total' || lowerCaseLabel === 'total transactions' || lowerCaseLabel==="trend" || lowerCaseLabel === 'goal' || lowerCaseLabel === 'goals' || lowerCaseLabel === 'total goal' || lowerCaseLabel === 'adjustedgoal'){
            return
        }
        dataset.data.forEach((amount,index)=>{
            if(!combinedDataSet[index]) combinedDataSet[index] = 0;
            if(isNaN(amount)) return;
            combinedDataSet[index] += amount;
        })
    })

    return combined ? combinedDataSet[chart.data.labels.indexOf(label)] : dataset?.data[chart.data.labels.indexOf(label)];
}

function xValue(ctx, index) {
    const chart = ctx.chart;
    if (index === -1) return;
    return chart.data.labels[index];
}

export default function useEvents(config) {
    const [categories, setCategories] = useState([]);
    const events = useUpdates("/api/views/events",config);
    const [activeLabel, setActiveLabel] = useState(null);
    function enter({ element}) {
        let id = element.options.id;
        setActiveLabel(id)
    }
    function leave() {
        setActiveLabel(null)
    }

    let {affected_categories, excludedCategories} = config;
    useEffect(() => {
        if(!events.length > 0) return;
        if(categories.length > 0) return;
        let temp = events.map((event) => event.affected_categories).flat();
        temp = [...new Set(temp)];
        setCategories(temp);
    }, [JSON.stringify(events), JSON.stringify(categories)])

    let reducedEvents = (dates) =>Object.values(events
            .sort((a,b) => new Date(a.event_date) - new Date(b.event_date))
            .reduce((acc,event) => {
                let date = event.event_date;
                if ((affected_categories?.length === 0 || !affected_categories) && excludedCategories.length > 0) {
                    affected_categories = categories.filter((category) => !excludedCategories.includes(category));
                }
                let isAffected = event.affected_categories.some((category) => affected_categories?.includes(category));
                if (!isAffected) {
                    return acc;
                }
                if(!acc[date]){
                    let index = findNearestIndex(dates,date);
                    let xPosition = index < 1 ? 'start' : index > dates.length - Math.round(dates.length * .1) ? 'end' : 'center';
                    let isActive = activeLabel === event.event_name;
                    let backgroundColor;
                    let color;
                    if(!activeLabel){
                        backgroundColor = 'rgba(255, 99, 132,.55)'
                        color = 'rgba(255, 255, 255,1)'
                    }else{
                        backgroundColor = isActive ? 'rgba(255, 99, 132,1)' : 'rgba(255, 99, 132,0)'
                        color = isActive ? 'rgba(255, 255, 255,1)' : 'rgba(255, 255, 255,0)';
                    }
                    acc[date] = [
                        {
                            type:'line',
                            color:'white',
                            xMin: index,
                            xMax: index,
                            borderColor: 'rgba(255, 99, 132, 0.75)',
                        },
                        {
                            id: event.event_name,
                            type:'label',
                            color:color,
                            xValue: (ctx)=> xValue(ctx,index),
                            yValue: (ctx) => yValue(ctx, xValue(ctx,index),config?.combined),
                            backgroundColor,
                            content: ['Notable Event',event.event_name],
                            click: ({element}) => select(element, 'rgba(165, 214, 167, 0.8)', 'rgba(165, 214, 167, 0.2)'),
                            enter: enter,
                            leave: leave,
                            stack:'x9x9x9x9',
                            position: {
                                x: xPosition,
                                y: 'end'
                            },
                        },
                    ];
                }else{
                    acc[date][1].content.push(event.event_name)
                }
                return acc;
            },{})).flat();



    return {events, categories,reducedEvents}
}