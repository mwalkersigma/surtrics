import React from "react";
import {
    Group,
    Text,
    Container,
    Paper,
    Title,
    Grid,
    Space,
    Badge,
    Progress, useMantineColorScheme, NumberFormatter
} from '@mantine/core';
import formatter from "../modules/utils/numberFormatter";
import {addDays, addHours, format, isWeekend, subHours} from "date-fns";
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
import StatsCard from "../components/mantine/StatsCard";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    DataLabels,
    PointElement,
    LineElement,
);


function DashboardCard({title, category, value , goal, errors,threshold,badgeText}) {
    let errorRate = (Math.round(errors / value * 100) / 100) * 100;
    return (<Paper withBorder p="md" radius="md">
        <Group align={'flex-start'} justify={'space-between'} mb={'xl'}>
            <Text size="md" c="dimmed">
                {title}
            </Text>
            <Badge color="teal" variant="light">
                {category}
            </Badge>
        </Group>

        <Group align={'flex-end'} justify={'space-between'}>
            <Title order={1}>
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
        <Progress value={(value / goal) * 100} mt={'sm'} mb={'lg'}/>
        <Group justify="space-between" mt="md">
            <Text fz="sm" c="dimmed">
                {value} / {goal} {category}
            </Text>
            {badgeText}
        </Group>


    </Paper>)
}
function WeekGraph ({weekSeed,goal,theme,shadowColor}){
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
            plugins: {
                legend: {
                    display: false,
                },
                datalabels: {
                    color: "#FFF",
                },
            },
            scales: {
                y:{
                    min: 0,
                    max: goal * 2,
                    display: false,
                    ticks: {
                        color: "#FFF"
                    }
                },
            },
        }}
        height={150}
    />
}

function DailyGraph ({dailyData,theme,shadowColor}){
    return <Line
        data={{
            labels: dailyData.map(({date_of_transaction}) => +(subHours(new Date(date_of_transaction),7).toLocaleTimeString().split(":")[0])),
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
                y:{
                    ticks: {
                        color: theme === "dark" ? "#FFF" : "#000"
                    }
                },
            },
        }}
        height={150}
    />
}

export default function ManLayout({children}) {
    const {colorScheme:theme} = useMantineColorScheme();
    const shadowColor = theme === "dark" ? colorScheme.white : colorScheme.dark;
    let date = new Date().toLocaleString().split("T")[0];
    const errorUpdates = useUpdates("/api/views/errors");

    let dailyData = useUpdates("/api/views/increments",{date, interval:"1 day", increment: "hour"});
    dailyData = dailyData
        .reduce((acc,curr) => {
            let date = new Date(curr.date_of_transaction).toLocaleString().split("T")[0];
            if (!acc[date]) acc[date] = 0;
            acc[date] += +curr.count;
            return acc
        },{})
    dailyData = Object.entries(dailyData).map(([date,count]) => ({date_of_transaction:date,count}));
    date = formatDateWithZeros(addDays(findStartOfWeek(new Date()),1))
    let weekData = useUpdates("/api/views/increments",{date,interval:"1 week",increment:"day"});
    weekData = processWeekData(weekData);

    let weekDays = weekData.filter(({date}) => !isWeekend(new Date(date)))

    const goal = useGoal();
    const hourlyGoal = goal / 7;

    let weekSeed = makeWeekArray(weekData,new Date(date));

    let weeklyErrors = errorUpdates
            .map((item)=>({...item,date_of_transaction:item.date_of_transaction.split("T")[0]}))
            .filter(({date_of_transaction}) => weekSeed.map(item=>item.date).includes(date_of_transaction))
            .reduce((acc,{count}) => acc + +count,0);

    let errorsToday = errorUpdates
        .map((item)=>({...item,date_of_transaction:item.date_of_transaction.split("T")[0]}))
        .filter(({date_of_transaction}) => date_of_transaction === new Date().toISOString().split("T")[0])
        .reduce((acc,{count}) => acc + +count,0);

    if (weekData.length === 0) return <div className={"text-center"}>Loading...</div>

    const totalIncrements = weekSeed.map(({count}) => +count).reduce((a,b)=>a+b,0);
    const totalForToday = dailyData.reduce((a,b) => a + +b.count,0);

    const dailyAverage = Math.round(totalIncrements / weekDays.length || 1);
    const hourlyAverage = Math.round(dailyAverage / 7 || 1);



    const bestDay = Math.max(...weekData.map(({count}) => +count));
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
            badgeText: `Average: ${hourlyAverage} /hr`
        },
        {
            title: "Total",
            category: "Increments",
            value: totalIncrements,
            goal: goal * 5,
            errors: weeklyErrors,
            threshold: 10,
            badgeText: `Average: ${dailyAverage} /day`
        },
    ]

    return (
        <Grid py={'xl'}>
            <Grid.Col span={1}></Grid.Col>
            <Grid.Col span={10}>
                <Grid>
                    {cards.map((test,index) => (
                        <Grid.Col key={index} span={4}>
                            <DashboardCard {...test} />
                        </Grid.Col>
                    ))}
                    <Grid.Col  span={6}>
                        <Paper withBorder p="md" radius="md">
                            <WeekGraph weekSeed={weekSeed} shadowColor={shadowColor} goal={goal} theme={theme}/>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Paper withBorder p="md" radius="md">
                            <DailyGraph dailyData={dailyData} shadowColor={shadowColor} theme={theme}/>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <StatsCard
                            stat={{
                                title:"Best Day",
                                value:bestDay,
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <StatsCard
                            stat={{
                                title:"Best Hour",
                                value:bestHour,
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <StatsCard
                            stat={{
                                title:"Errors for week",
                                value:weeklyErrors,
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <StatsCard
                            stat={{
                                title:"Errors for day",
                                value:errorsToday,
                            }}
                        />
                    </Grid.Col>
                </Grid>
            </Grid.Col>
            <Grid.Col span={1}></Grid.Col>
        </Grid>
    );
}

