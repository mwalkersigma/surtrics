import {useEffect, useState} from "react";
import useUpdates from "./useUpdates";

function findNearestIndex(array, value) {
    let nearestDate = array.reduce((acc,date) => {
        let date1 = new Date(date);
        let date2 = new Date(value);
        console.log(date1,date2)
        if(date1 > date2) return acc;
        if(acc === null) return date;
        if(date1 > new Date(acc)) return date;
        return acc;
    },0)
    console.log(nearestDate)

    return Math.min(Math.max(array.indexOf(nearestDate),.5),array.length-1.5);
}

export default function useEvents(config) {
    const [categories, setCategories] = useState([]);
    const events = useUpdates("/api/views/events",config);



    const{ affected_categories } = config;

    useEffect(() => {
        if(!events.length > 0) return;
        if(categories.length > 0) return;
        let temp = events.map((event) => event.affected_categories).flat();
        temp = [...new Set(temp)];
        setCategories(temp);
    },[events,categories])

    let reducedEvents = (dates) => Object.values(events
        .sort((a,b) => new Date(a.event_date) - new Date(b.event_date))
        .reduce((acc,event) => {
            let date = event.event_date;
            let isAffected = event.affected_categories.some((category) => affected_categories.includes(category));
            if(!isAffected) return acc;
            if(!acc[date]){
                let index = findNearestIndex(dates,date);
                acc[date] = [
                    {
                        type:'label',
                        color:'white',
                        xMin: index,
                        xMax: index,
                        yMin: config.minY,
                        yMax: 0,
                        backgroundColor: 'rgba(255, 99, 132,.55)',
                        content: ['Notable Event',event.event_name],
                    },
                    {
                        type:'line',
                        color:'white',
                        xMin: index,
                        xMax: index,
                        borderColor: 'rgba(255, 99, 132, 0.75)',
                    }
                ];
            }else{
                acc[date][0].content.push(event.event_name)
            }
            return acc;
        },{})).flat()


    return {events, categories,reducedEvents}
}