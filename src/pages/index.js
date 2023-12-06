import React from "react";
import {Badge, Center, Grid, Group, Paper, Progress, Space, Text, Title, useMantineColorScheme} from '@mantine/core';
import formatter from "../modules/utils/numberFormatter";
import {addDays, addHours, format} from "date-fns";
import {Bar, Line} from "react-chartjs-2";
import {colorScheme} from "./_app";
import useUpdates from "../modules/hooks/useUpdates";
import formatDateWithZeros from "../modules/utils/formatDateWithZeros";
import findStartOfWeek from "../modules/utils/findSundayFromDate";
import processWeekData from "../modules/utils/processWeekData";
import useGoal from "../modules/hooks/useGoal";
import makeWeekArray from "../modules/utils/makeWeekArray";
import {BarElement, CategoryScale, Chart as ChartJS, LinearScale, LineElement, PointElement} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import useNav from "../modules/hooks/useNav";
import { useViewportSize } from "@mantine/hooks";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    DataLabels,
    PointElement,
    LineElement,
);


function normalize(minIn, maxIn, minOut, maxOut) {
    return (value)=> {
        if(value > maxIn) return maxOut;
        if(value < minIn) return minOut;
        return (value - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
    }
}

let normalized = normalize(730, 1375, 200, 800);
const Theme = (theme) => theme === "dark" ? colorScheme.light : colorScheme.dark;
const times = [
    "6 AM",
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM"
];

function DashboardCard({title, category, value , goal, errors,threshold,badgeText,  hasNav}) {
    let errorRate = (Math.round(errors / value * 100) / 100) * 100;
    return (<Paper withBorder p="md" radius="md">
        <Group align={'flex-start'} justify={'space-between'} mb={'xl'}>
            <Text size={hasNav ? "md" : "xl"} c="dimmed">
                {title}
            </Text>
            <Badge color="teal" variant="light">
                {category}
            </Badge>
        </Group>

        <Group align={'flex-end'} justify={'space-between'}>
            <Title order={1} style={{fontSize:`${hasNav ? "" : "56px"}`}}>
                {formatter(value)}
            </Title>
            { errors && errors > 0 && <Text fz="xs" c="dimmed">
                Error Rate :
                <span style={{color: `${errorRate < threshold ? 'teal' : 'red'}`}}> {errorRate}</span>
                %
            </Text>}
        </Group>

        <Space h={'lg'}/>

        <Group justify={'space-between'}>
            <Text size="md" c="dimmed">
                Progress
            </Text>
            <Text size="md" c="dimmed">
                {formatter((value / goal) * 100)} %
            </Text>
        </Group>
        <Progress size={20} value={(value / goal) * 100} mt={'sm'} mb={'lg'}/>
        <Group justify="space-between" mt="md">
            <Text fz="sm" c="dimmed">
                {value} / {goal} {category}
            </Text>
            {badgeText}
        </Group>


    </Paper>)
}
function WeekGraph ({weekSeed,goal,theme, height}){
    let dateLabels = weekSeed.map(({date}) => format(addHours(new Date(date),6),"EEE MM/dd"));
    return <Bar
        data={{
            labels: dateLabels,
            datasets:[
                {
                    data:weekSeed.map(({count}) => +count),
                    borderColor: (ctx) => ctx?.parsed?.y < goal ? colorScheme.red : colorScheme.green,
                    backgroundColor: (ctx) => ctx?.parsed?.y < goal ? colorScheme.red : colorScheme.green,
                }
            ]
        }}
        options={{
            devicePixelRatio: 4,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                datalabels: {
                    color: "#FFF",
                },
            },
            scales: {
                x:{
                    ticks: {
                        color: Theme(theme) + "AA"
                    },
                    grid: {
                        color: Theme(theme) + "AA"
                    }
                },
                y:{
                    max : goal * 2,
                    ticks: {
                        color: Theme(theme) + "AA"
                    },
                    grid: {
                        color: Theme(theme) + "AA"
                    }
                },
            },
        }}
        height={height}
    />
}
function DailyGraph ({dailyData,theme,height}){
    return <Line
        data={{
            labels: times.slice(0,dailyData.length),
            datasets:[
                {
                    data:dailyData.map(({count}) => +count),
                    borderColor:'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                }
            ]
        }}
        options={{
            devicePixelRatio: 4,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                datalabels: {
                    display: false,
                    color: theme === "dark" ? "#fff" : "#000",
                    align: "top",
                },
            },
            scales: {
                x:{
                    ticks: {
                        color: Theme(theme) + "AA"
                    },
                    grid: {
                        color: Theme(theme) + "AA"
                    }
                },
                y:{
                    ticks: {
                        color: Theme(theme) + "AA"
                    },
                    grid: {
                        color: Theme(theme) + "AA"
                    }
                },
            },
        }}
        height={height}
    />
}


function handleDailyData(dailyData){
    let temp = dailyData
        .reduce((acc,curr) => {
            let date = new Date(curr.date_of_transaction).toLocaleString();
            if (!acc[date]) acc[date] = 0;
            acc[date] += +curr.count;
            return acc
        },{})
    return Object.entries(temp).map(([date,count]) => ({date_of_transaction:date,count}));

}

export default function ManLayout({}) {
    const hasNav = useNav();
    let date = new Date()
    const {colorScheme:theme} = useMantineColorScheme();
    const errorUpdates = useUpdates("/api/views/errors");

    let dailyData = useUpdates("/api/views/increments",{date:date.toLocaleDateString(), interval:"1 day", increment: "hour"});
    let processedDailyData = handleDailyData(dailyData);
    console.log(processedDailyData)
    date = formatDateWithZeros(addDays(findStartOfWeek(new Date()),1))
    let weekData = useUpdates("/api/views/increments",{date,interval:"1 week",increment:"day"});
    let processedWeekData = processWeekData(weekData);
    const {height:viewportHeight} = useViewportSize();

    let height = normalized(viewportHeight)
    if(hasNav) height = height - 50;


    const goal = useGoal();
    const hourlyGoal = goal / 7;

    let weekSeed = makeWeekArray(processedWeekData,new Date(date));


    let weeklyErrors = errorUpdates
            .map((item)=>({...item,date_of_transaction:item.date_of_transaction.split("T")[0]}))
            .filter(({date_of_transaction}) => weekSeed.map(item=>item.date).includes(date_of_transaction))
            .reduce((acc,{count}) => acc + +count,0);

    let errorsToday = errorUpdates
        .map((item)=>({...item,date_of_transaction:item.date_of_transaction.split("T")[0]}))
        .filter(({date_of_transaction}) => date_of_transaction === new Date().toISOString().split("T")[0])
        .reduce((acc,{count}) => acc + +count,0);

    if (processedWeekData.length === 0) return <div className={"text-center"}>Loading...</div>

    const totalIncrements = weekSeed.map(({count}) => +count).reduce((a,b)=>a+b,0);
    const totalForToday = dailyData.reduce((a,b) => a + +b.count,0);
    const dailyAverage = Math.round(totalIncrements / (processedWeekData.length || 1));
    const hourlyAverage = Math.round(dailyAverage / 7 || 1);

    const bestDay = Math.max(...processedWeekData.map(({count}) => +count));
    const bestHour = Math.max(...dailyData.map(({count}) => +count));

    let cards = [
        {
            title: "Hourly",
            category: "Increments",
            value: formatter(dailyData.slice(-1)[0]?.count),
            goal: formatter(Math.round(hourlyGoal)),
            errors: 0,
            threshold: 10,
        },
        {
            title: "Daily",
            category: "Increments",
            value: totalForToday,
            goal: formatter(goal),
            errors: errorsToday,
            threshold: 10,
            badgeText: `${hourlyAverage} /hr`
        },
        {
            title: "Total",
            category: "Increments",
            value: totalIncrements,
            goal: goal * 5,
            errors: weeklyErrors,
            threshold: 10,
            badgeText: `${dailyAverage} /day`
        },
    ]

    return (
        <Center h={`${!hasNav && "100vh"}`}>
            <Grid py={`${!hasNav && "xl"}`} >
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={10}>
                    <Grid>
                        {cards.map((card,i) => (
                            <Grid.Col span={4} key={i}>
                                <DashboardCard key={i} hasNav={hasNav} {...card} />
                            </Grid.Col>
                            )
                        )}
                        <Grid.Col span={6}>
                            <Paper h={height} withBorder p="md" radius="md">
                                <WeekGraph weekSeed={weekSeed}  goal={goal} theme={theme}/>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Paper h={height} withBorder p="md" radius="md">
                                <DailyGraph dailyData={processedDailyData}  theme={theme}/>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Paper ta={"center"} withBorder p="md" radius="md">
                                <Text fz="lg" c="dimmed">
                                    Best Day
                                </Text>
                                <Title fz={'56px'}>
                                    {formatter(bestDay)}
                                </Title>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Paper ta={"center"} withBorder p="md" radius="md">
                                <Text fz="lg" c="dimmed">
                                    Best Hour
                                </Text>
                                <Title fz={'56px'}>
                                    {formatter(bestHour)}
                                </Title>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Paper ta={"center"} withBorder p="md" radius="md">
                                <Text fz="lg" c="dimmed">
                                    Errors for week
                                </Text>
                                <Title fz={'56px'}>
                                    {formatter(weeklyErrors)}
                                </Title>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Paper ta={"center"} withBorder p="md" radius="md">
                                <Text fz="lg" c="dimmed">
                                    Errors for day
                                </Text>
                                <Title fz={'56px'}>
                                    {formatter(errorsToday)}
                                </Title>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
                <Grid.Col span={1}></Grid.Col>
            </Grid>
        </Center>
    );
}

