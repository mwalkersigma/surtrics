import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {NativeSelect, Slider, Text, Tooltip, useMantineColorScheme} from "@mantine/core";
import useUsage from "../../../modules/hooks/useUsage";
import {colorScheme} from "../../_app";
import BaseChart from "../../../components/Chart";
import StatCard from "../../../components/mantine/StatCard";
import formatter from "../../../modules/utils/numberFormatter";
import useEvents from "../../../modules/hooks/useEvents";
import {useDebouncedValue} from "@mantine/hooks";
import smoothData from "../../../modules/utils/graphUtils/smoothData";
import colorizeLine from "../../../modules/utils/colorizeLine";

const parseTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;
const RangeView = () => {
    useUsage("Metrics", "quantity-range-chart")
    const [[startDate, endDate], setDates] = useState([new Date('12-01-2023'), new Date('12-31-2023')]);
    const [interval, setInterval] = useState('week');
    const [resolution, setResolution] = useState(4);
    const [debounced] = useDebouncedValue(resolution, 500);

    const quantities = useUpdates("/api/views/quantity/totalOnly", {startDate: startDate, endDate: endDate,interval});

    const {reducedEvents} = useEvents({
        startDate,
        endDate,
        timeScale:'month',
        includedCategories:['Processing'],
        affected_categories:['Processing']
    })


    const {colorScheme: theme} = useMantineColorScheme();

    const names = [...new Set(quantities.map(({name}) => name))];
    const dates = [...new Set(quantities.map(({date}) => date))].sort((a, b) => new Date(a) - new Date(b));

    let events = reducedEvents(dates)

    names.forEach((name) => {
        dates.forEach((date) => {
            const found = quantities.find((quantity) => quantity.name === name && quantity.date === date);
            if (!found) quantities.push({name, date: date, sum: null})
        })
    })

    const dataForGraph = names.reduce((acc, cur) => {
        if (!acc[cur]) acc[cur] = [];
        dates.forEach((date) => {
            const found = quantities.find((quantity) => quantity.name === cur && quantity.date === date);
            acc[cur].push(found?.sum)
        })
        return acc
    }, {})



    const options = {
        plugins: {
            tooltip: {
                color: parseTheme(theme),
                callbacks: {
                    footer: (context) => {
                        return "TOTAL: " + formatter(context.reduce((acc, {raw}) => (acc + +raw), 0));
                    }
                }
            },
            datalabels: {
                color: parseTheme(theme),
            },
        },
    }

    const data = {
        labels: dates.map((date) => new Date(date).toLocaleDateString()),
        datasets: Object.entries(dataForGraph).map(([name, graphData], i) => {
            return {
                label: name,
                data: graphData,
                borderWidth: 1,
                stack: 1,
                type: "bar"
            }
        })
    };
    let totals = [];
    console.log(data.datasets)

    for(let i = 0 ; i < data.datasets.length; i++){
        for(let j = 0; j < data.datasets[i].data.length; j++){
         if(!totals[j]) totals[j] = [];
         let entry = data.datasets[i].data[j];
         totals[j].push(data.datasets[i].data[j])
        }
    }

    totals = totals.map((total) => total.reduce((acc,cur) => acc + +cur,0))

    console.log(totals)
    const smooth = smoothData(totals,resolution);
    data.datasets.push({
        label: "Trend Line",
        type: "line",
        fill: false,
        borderWidth: 2,
        stack:2,
        datalabels: {
            display: false
        },
        data: smooth,
        segment: {
            borderColor: colorizeLine({up:'limeGreen',down:'red',unchanged:'blue'})
        },
    })



    return (
        <GraphWithStatCard
            title={"Surplus Quantity Range View"}
            dateInput={
                <CustomRangeMenu
                    subscribe={setDates}
                    defaultValue={[startDate, endDate]}
                    label={"Date Range"}
                    mb={'xl'}
                />
            }
            slotOne={
                <NativeSelect
                    label={"Interval"}
                    placeholder={"Select an interval"}
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    data={[
                        {value: 'day', label: 'Daily'},
                        {value: 'week', label: 'Weekly'},
                        {value: 'month', label: 'Monthly'},
                        {value: 'quarter', label: 'Quarterly'},
                        {value: 'year', label: 'Yearly'},
                    ]}
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
            cards={[
                {value: quantities.reduce((acc, {sum}) => (acc + +sum), 0), title: "Total Quantity"},
                {value: quantities.reduce((acc, {sum}) => (acc + +sum), 0) / quantities.filter(({sum})=>sum).length, title: "Average Quantity"},
                {
                    title: `Best ${interval}`,
                    value: Math.max(...quantities.map(({sum}) => sum)),
                    subtitle: quantities
                        .filter(({sum})=>sum)
                        .find(({sum})=> Number(sum) === Math.max(...quantities.map(({sum})=>Number(sum))))
                        ?.name

                },
            ].map((stat,i)=> <StatCard key={i} stat={stat} />)}
        >
            <BaseChart events={events} stacked data={data} config={options}/>
        </GraphWithStatCard>
    );
};

export default RangeView;