import React, {useState} from 'react';
import LineGraph from "../../../components/lineGraph";

import useUpdates from "../../../modules/hooks/useUpdates";
import {useMantineColorScheme} from "@mantine/core";

import {
    CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip
} from "chart.js";

import {DatePickerInput} from "@mantine/dates";
import StatCard from "../../../components/mantine/StatCard";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";


ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement,);

const DailyView = () => {
    const [date, setDate] = useState(new Date())
    let dailyData = useUpdates("/api/views/increments", {date, interval: "1 day", increment: "hour"});
    const {colorScheme: theme} = useMantineColorScheme();

    let chartData = dailyData
        .reduce((acc, curr) => {
            let date = new Date(curr.date_of_transaction).toLocaleString().split("T")[0];
            if (!acc[date]) acc[date] = 0;
            acc[date] += +curr.count;
            return acc
        }, {})
    chartData = Object.entries(chartData).map(([date, count]) => ({date_of_transaction: date, count}));
    chartData = chartData.map(({count}) => +count);

    return (
        <GraphWithStatCard
            title={"Surplus Increments Daily View"}
            dateInput={
                <DatePickerInput
                    mb={"xl"}
                    label={"Date"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            isLoading={dailyData.length === 0}
            cards={
                [
                    <StatCard
                        key={0}
                        stat={{
                            title: "Total Increments",
                            value: (chartData.reduce((a, b) => a + b, 0)),
                        }}/>,
                    <StatCard
                        key={1}
                        stat={{
                            title: "Average Increments",
                            value: (Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length)),
                        }}/>,
                    <StatCard
                        key={2}
                        stat={{
                            title: "Best Hour",
                            value: (chartData.reduce((a, b) => a > b ? a : b, 0)),
                        }}/>,
                    <StatCard
                        key={3}
                        stat={{
                            title: "New Inbound",
                            value: (dailyData
                                .filter((item) => (item.transaction_reason === "Add on Receiving" || item.transaction_reason === "Add"))
                                .reduce((acc, {count}) => acc + +count, 0)),
                        }}
                    />,
                    <StatCard
                        key={4}
                        stat={{
                            title: "Re-listings",
                            value: (dailyData
                                .filter((item) => (item.transaction_reason === "Relisting"))
                                .reduce((acc, {count}) => acc + +count, 0)),
                        }}/>
                ]
            }
        >
            <LineGraph date={date} dailyData={chartData} theme={theme}/>
        </GraphWithStatCard>
    );
};


export default DailyView;