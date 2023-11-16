import React, {useState} from 'react';
import yymmddTommddyy from "../../../modules/utils/yymmddconverter";
import useUpdates from "../../../modules/hooks/useUpdates";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Title as chartTitle,
    Tooltip
} from "chart.js";
import {Line} from "react-chartjs-2";
import DataLabels from "chartjs-plugin-datalabels";
import {colorScheme} from "../../_app";
import {setDate} from "date-fns";
import {useMantineColorScheme, Grid, Skeleton, Stack, Title, Container} from "@mantine/core";
import {MonthPickerInput} from "@mantine/dates";
import StatsCard from "../../../components/mantine/StatsCard";



ChartJS.register(
    CategoryScale,
    LinearScale,
    chartTitle,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    DataLabels
);




function LineGraphMonthly ({monthData,theme}) {
    theme = theme === "dark" ? colorScheme.white : colorScheme.dark;
    const options = {
        devicePixelRatio: 4,
        responsive: true,
        maintainAspectRatio: false,
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
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales:{
            y: {
                min: 0,
                ticks: {
                    color: theme + "A"
                },
                grid: {
                    color: theme + "3"
                }
            },
            x:{
                ticks: {
                    color: theme + "A"
                },
                grid: {
                    color: theme + "3"
                }
            }
        }
    };
    const dataSets = monthData.reduce((acc,curr)=>{
        let date = curr.date_of_transaction.split("T")[0];
        if(!acc[date]){
            acc[date] = {
                day: date,
                total: +curr.count,
                [curr['transaction_reason']]: +curr.count
            }
            return acc;
        }
        acc[date].total += +curr.count;
        acc[date][curr['transaction_reason']] = +curr.count;
        return acc
    },{})
    const graphData = {
        labels: Array
            .from(new Set(monthData.map(({date_of_transaction}) => date_of_transaction.split("T")[0])))
            .map(yymmddTommddyy)
        ,
        datasets: [
            {
                label: "Total",
                data: Object.values(dataSets).map((item) => item["total"] ?? 0),
                borderColor: colorScheme.indigo,
                backgroundColor: colorScheme.indigo,
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "Incrementation",
                data: Object.values(dataSets).map((item) => item["Add"] ?? 0),
                borderColor: colorScheme.green,
                backgroundColor: colorScheme.green,
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "New Inbound",
                data: Object.values(dataSets).map((item) => item["Add on Receiving"] ?? 0),
                borderColor: colorScheme.red,
                backgroundColor: colorScheme.red,
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            },
            {
                label: "Relisting",
                data: Object.values(dataSets).map((item) => item["Relisting"] ?? 0),
                borderColor: colorScheme.blue,
                backgroundColor: colorScheme.blue,
                datalabels: {
                    color: theme,
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                }
            }
        ]
    }
    return (
        <Line data={graphData} height={150} title={"Monthly View"} options={options} />
    )
}
const dateSet = setDate;
const MonthlyView = () => {

    const [date,setDate] = useState(dateSet(new Date(),1))
    let monthData = useUpdates("/api/views/increments",{date,interval:"1 month",increment:"day"});
    const {colorScheme:theme} = useMantineColorScheme();
    if(monthData.length === 0){
        return(
            <Container fluid>
                <Title ta={"center"}>Surplus Increments Weekly View</Title>
                <Grid spacing={"xl"}>
                    <Grid.Col span={1}></Grid.Col>
                    <Grid.Col span={8}>
                        <MonthPickerInput
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
            </Container>
        );
    }

    // group by date
    // add a total field
    let cardData = monthData.reduce((acc,curr)=>{
        let date = curr.date_of_transaction.split("T")[0];
        if(!acc[date]){
            acc[date] = {
                day: date,
                total: +curr.count,
                [curr['transaction_reason']]: +curr.count
            }
            return acc;
        }
        acc[date].total += +curr.count;
        acc[date][curr['transaction_reason']] = +curr.count;
        return acc
    },{})
    cardData = Object.values(cardData);

    return (
        <Container fluid>
            <Title ta={"center"}>Surplus Increments Weekly View</Title>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={8}>
                    <MonthPickerInput
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
                        <LineGraphMonthly monthData={monthData} theme={theme}/>
                    </div>
                </Grid.Col>
                <Grid.Col span={2}>
                    <Stack>
                        <Stack>
                            <StatsCard
                                stat={{
                                    title: "Total",
                                    value: (cardData.reduce((acc, {total}) => acc + +total, 0)),

                                }}/>
                            <StatsCard
                                stat={{
                                    title: "Average",
                                    value: (Math.round(cardData.reduce((acc, {total}) => acc + +total, 0) / cardData.length)),
                                }}/>
                            <StatsCard
                                stat={{
                                    title: "Best Day", value: Math.max(...cardData.map(({total}) => total)),
                                }}/>
                            <StatsCard
                                stat={{
                                    title: "New Inbound",
                                    value: (cardData.reduce((acc, cur) => acc + ((cur?.['Add on Receiving'] ?? 0) + (cur?.["Add"] ?? 0)), 0)) ,
                                }}
                            />
                            <StatsCard
                                stat={{
                                    title: "Re-listings",
                                    value: (cardData.reduce((acc, cur) => acc + cur?.['Relisting'] ?? 0 , 0)),
                                }}/>
                        </Stack>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
};




export default MonthlyView;