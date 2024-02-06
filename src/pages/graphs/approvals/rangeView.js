import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../../modules/utils/formatDateWithZeros";
import makeDateArray from "../../../modules/utils/makeDateArray";
import {colorScheme} from "../../_app";
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";
import {addDays, subDays} from "date-fns";
import StatCard from "../../../components/mantine/StatCard";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {NativeSelect, Slider, Text, Tooltip} from "@mantine/core";
import smoothData from "../../../modules/utils/graphUtils/smoothData";
import normalize from "../../../modules/utils/normalize";


let colorPalette = [
    colorScheme.blue,
    colorScheme.green,
    colorScheme.red,
    colorScheme.purple,
    colorScheme.yellow,
    colorScheme.orange,
    colorScheme.pink,
]


const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
const up = (ctx, value) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined;


const RangeView = () => {
    let increments = ["day", "week", "month", "quarter", "year"];
    useUsage("Metrics", "Approvals-chart");

    const [[startDate, endDate], setDateRange] = useState([subDays(new Date(), 30), new Date()]);
    const [increment, setIncrement] = useState("week");
    const [resolution, setResolution] = useState(4);

    let approvals = useUpdates("/api/views/approvals", {startDate, endDate, increment});
    approvals = approvals.filter(({name}) => name !== "")


    let names = [...new Set(approvals.map(({name}) => name))];

    let dates = [...new Set(approvals.map(({date_of_final_approval}) => date_of_final_approval))];

    let dataForGraph = {};

    dates.forEach((date) => {
        dataForGraph[date] = {};
        names.forEach((name) => {
            dataForGraph[date][name] = 0;
        })
    });

    approvals.forEach((approval) => {
        dataForGraph[approval.date_of_final_approval][approval.name] += Number(approval.count);
    })

    let dataForTrend = Object
        .values(dataForGraph)
        .map((obj) => Object.values(obj).reduce((acc, cur) => acc + cur, 0));

    const data = {
        labels: dates.map((date) => new Date(date).toLocaleDateString()),
        datasets: [
            {
                label: "Trend",
                data: smoothData(dataForTrend, resolution),
                fill: false,
                segment: {
                    borderColor: ctx => up(ctx, 'rgb(0,255,0)') || down(ctx, 'rgb(255,0,0)'),
                    backgroundColor: ctx => up(ctx, 'rgba(0,255,0,0.1)') || down(ctx, 'rgba(255,0,0,0.1)'),
                },
                radius: 0,
                type: "line",
                tension: 0.4,
                stack: 2
            },
            ...names.map((name, i) => {
                return {
                    label: name,
                    data: Object.values(dataForGraph).map((obj) => obj[name]),
                    backgroundColor: colorPalette[i % colorPalette.length],
                    borderColor: colorPalette[i % colorPalette.length],
                    borderWidth: 1,
                    stack: 1,
                    type: "bar"
                }
            })
        ]
    };
    const totalApprovals = approvals?.reduce((acc, cur) => acc + +cur.count, 0);
    const averageApprovals = totalApprovals / approvals?.length;
    const bestDay = approvals?.reduce((acc, cur) => {
        if (acc.count < +cur.count) return cur;
        return acc;
    }, {count: 0});

    let bestOverall = {};

    names.forEach((name) => {
        bestOverall[name] = 0
    })

    approvals.forEach((approval) => {
        let name = approval.name;
        let count = approval.count;
        bestOverall[name] += Number(count);
    })

    let temp = bestOverall;
    bestOverall = {name: null, count: 0};

    Object.entries(temp).forEach(([key, value]) => {
        if (value > bestOverall.count) {
            bestOverall.name = key;
            bestOverall.count = value;
        }
    })

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    footer: (context) => {
                        return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }
            },
            title: {
                text: "Week View"
            }
        },

        scales: {
            y: {
                max: Math.ceil(totalApprovals / dates.length * 2.5)
            }
        }
    }


    return <GraphWithStatCard
        title={"Surplus Template Approvals Range View"}
        cards={[
            <StatCard
                key={0}
                stat={{
                    title: "Total",
                    value: totalApprovals,
                    subtitle: "Approvals for the week"
                }}
            />,
            <StatCard
                key={1}
                stat={{
                    title: "Average Approvals",
                    value: averageApprovals,
                    subtitle: "Per Person Per Day"
                }}
            />,
            <StatCard
                key={2}
                stat={{
                    title: "Best Day",
                    value: bestDay.count,
                    subtitle: `${bestDay.name} - ${new Date(bestDay.date_of_final_approval).toLocaleDateString()}`
                }}
            />,
            <StatCard
                key={3}
                stat={{
                    title: `Most approvals`,
                    value: bestOverall.count,
                    subtitle: bestOverall.name
                }}
            />,
        ]}

        dateInput={
            <CustomRangeMenu
                subscribe={setDateRange}
                defaultValue={[startDate, endDate]}
                label={"Date Range"}
                mb={'xl'}
            />
        }
        slotOne={
            <NativeSelect
                label={"Interval"}
                value={increment}
                onChange={(e) => setIncrement(e.target.value)}
                data={increments.map((increment) => ({label: increment, value: increment}))}
            />
        }
        slotTwo={
            <Tooltip label={"The higher the resolution, the smoother the trend line."}>
                    <span>
                        <Text ml={"xs"}>Trend Line Resolution</Text>
                        <Slider
                            mb={"xl"}
                            ml={"xs"}
                            color="blue"
                            marks={[
                                {value: 0, label: 'none'},
                                {value: 2, label: '2'},
                                {value: 4, label: '4'},
                                {value: 6, label: '6'},
                                {value: 8, label: 'linear'},
                            ]}
                            min={0}
                            max={8}
                            value={resolution}
                            onChange={(e) => setResolution(e)}
                        />
                    </span>
            </Tooltip>
        }

    >
        <BaseChart data={data} config={options} stacked/>
    </GraphWithStatCard>
};

export default RangeView;