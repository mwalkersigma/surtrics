import React, {useState} from 'react';
import LineGraph from "../../../components/lineGraph";

import useUpdates from "../../../modules/hooks/useUpdates";
import formatter from "../../../modules/utils/numberFormatter";
import {
    Container, Stack, useMantineColorScheme, Grid, Skeleton, Title
} from "@mantine/core";

import {
    CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip
} from "chart.js";

import {DatePickerInput} from "@mantine/dates";
import StatsCard from "../../../components/mantine/StatsCard";


ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement,);

const DailyView = () => {
    const [date, setDate] = useState(new Date())
    let dailyData = useUpdates("/api/views/increments", {date, interval: "1 day", increment: "hour"});
    const {colorScheme: theme} = useMantineColorScheme();

    if (dailyData.length === 0) return (<Container fluid>
            <Title ta={"center"}>Surplus Increments Daily View</Title>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={8}>
                    <DatePickerInput
                        mt={"xl"}
                        mb={"xl"}
                        label={"Date"}
                        value={date}
                        onChange={(e) => setDate(e)}
                    />
                </Grid.Col>
                <Grid.Col span={3}></Grid.Col>
            </Grid>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={8}>
                    <Skeleton height={"65vh"} radius="md" animate={false}/>
                </Grid.Col>
                <Grid.Col span={2}>
                    <Stack>
                        <Skeleton height={110} radius="md" animate={false}/>
                        <Skeleton height={110} radius="md" animate={false}/>
                        <Skeleton height={110} radius="md" animate={false}/>
                        <Skeleton height={110} radius="md" animate={false}/>
                        <Skeleton height={110} radius="md" animate={false}/>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>);

    let chartData = dailyData
        .reduce((acc, curr) => {
            let date = new Date(curr.date_of_transaction).toLocaleString().split("T")[0];
            if (!acc[date]) acc[date] = 0;
            acc[date] += +curr.count;
            return acc
        }, {})
    chartData = Object.entries(chartData).map(([date, count]) => ({date_of_transaction: date, count}));
    chartData = chartData.map(({count}) => +count);

    let margin = "1rem";
    return (<Container fluid>
            <Title ta={"center"}>Surplus Increments Daily View</Title>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={8}>
                    <DatePickerInput
                        mt={"xl"}
                        mb={"xl"}
                        label={"Date"}
                        value={date}
                        onChange={(e) => setDate(e)}
                    />
                </Grid.Col>
                <Grid.Col span={3}></Grid.Col>
            </Grid>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={8}>
                    <div style={{position: "relative", height: "100%"}} className={"chart-container"}>
                        <LineGraph date={date} dailyData={chartData} theme={theme}/>
                    </div>
                </Grid.Col>
                <Grid.Col span={2}>
                    <Stack>
                        <StatsCard
                            stat={{
                                title: "Total", value: formatter(chartData.reduce((a, b) => a + b, 0)),
                            }}/>
                        <StatsCard
                            stat={{
                                title: "Average",
                                value: formatter(Math.round(chartData.reduce((a, b) => a + b, 0) / dailyData.length)),
                            }}/>
                        <StatsCard
                            stat={{
                                title: "Best Hour", value: formatter(chartData.reduce((a, b) => a > b ? a : b, 0)),
                            }}/>
                        <StatsCard
                            stat={{
                                title: "New Inbound", value: formatter(dailyData
                                    .filter((item) => (item.transaction_reason === "Add on Receiving" || item.transaction_reason === "Add"))
                                    .reduce((acc, {count}) => acc + +count, 0)),
                            }}
                        />

                        <StatsCard
                            stat={{
                                title: "Re-listings", value: formatter(dailyData
                                    .filter((item) => (item.transaction_reason === "Relisting"))
                                    .reduce((acc, {count}) => acc + +count, 0)),
                            }}/>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>);
};


export default DailyView;