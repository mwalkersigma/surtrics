import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {NativeSelect, useMantineColorScheme} from "@mantine/core";
import useUsage from "../../../modules/hooks/useUsage";
import {colorScheme} from "../../_app";
import BaseChart from "../../../components/Chart";
import StatCard from "../../../components/mantine/StatCard";

const parseTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;
const RangeView = () => {
    useUsage("Metrics", "quantity-range-chart")
    const [[startDate, endDate], setDates] = useState([new Date('12-01-2023'), new Date('12-31-2023')]);
    const [interval, setInterval] = useState('week');

    const quantities = useUpdates("/api/views/quantity/totalOnly", {startDate: startDate, endDate: endDate,interval});

    const {colorScheme: theme} = useMantineColorScheme();

    const names = [...new Set(quantities.map(({name}) => name))];
    const dates = [...new Set(quantities.map(({date}) => date))].sort((a, b) => new Date(a) - new Date(b));

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
                        return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
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
                backgroundColor: colorScheme.byIndex(i),
                borderColor: colorScheme.byIndex(i),
                borderWidth: 1,
                stack: 1,
                type: "bar"
            }
        })
    };




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
            <BaseChart stacked data={data} config={options}/>
        </GraphWithStatCard>
    );
};

export default RangeView;