import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip as ChartTooltip
} from "chart.js";
import {Line} from "react-chartjs-2";
import {colorScheme} from "../../_app";
import {setDate, setMonth} from "date-fns";
import {YearPickerInput} from "@mantine/dates";
import {NativeSelect, Slider, Text, Tooltip} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import StatCard from "../../../components/mantine/StatCard";


const ignoredNames = [
    "Bail", "" , "Whit","Finley Aldrid"
]

ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    ChartTooltip,
    Legend,
    LineElement,
    PointElement,
);
function findLinearTrendLine(data) {
    const n = data.length;

    // Calculate sums
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += data[i][0];
        sumY += data[i][1];
        sumXY += data[i][0] * data[i][1];
        sumX2 += data[i][0] * data[i][0];
    }

    // Calculate slope (m) and y-intercept (b) of the trendline
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Create the trendline function
    const trendline = (_,x) => slope * x + intercept;

    return data.map(trendline)
}

function smoothData(data,adjCount=3) {

    if(adjCount === 0) return data;
    if(adjCount === 8) return findLinearTrendLine(Object.values(data).map((x,i) => [i+1,x]));

    let newData = [];
    for(let i = 0; i < data.length; i++) {
        let sum = 0;
        if(i < adjCount) {
            for(let j = 0; j < i + adjCount; j++) {
                sum += data[j];
            }
            newData.push(sum / (i + adjCount));
            continue;
        }

        if(i > data.length - adjCount) {
            for(let j = i - adjCount; j < data.length; j++) {
                sum += data[j];
            }
            newData.push(sum / (data.length - i + adjCount));
            continue;
        }

        for(let j = i - adjCount; j < i + adjCount; j++) {
            sum += data[j];
        }
        newData.push(sum / (adjCount * 2 + 1));
    }
    return newData;
}

const dateSet = setDate
const ApprovalsView = () => {
    let [user, setUser] = useState("Total");
    const [date,setDate] = useState(dateSet(setMonth(new Date(),0),1));
    const [resolution, setResolution] = useState(4);
    const updates = useUpdates("/api/views/approvals", {date, interval:"1 year", increment:"week"});

    let mappedUpdates = {Total:{}};
    updates
        .sort((a,b) => {
            let aDate = a["date_of_final_approval"];
            let bDate = b["date_of_final_approval"];
            if(aDate < bDate) return -1;
            if(aDate > bDate) return 1;
            return 0;
        })
        .forEach((update) => {
            let name = update.name;
            let date = update["date_of_final_approval"].split("T")[0];
            if(!mappedUpdates[name]) mappedUpdates[name] = {};
            if(!mappedUpdates[name][date]) mappedUpdates[name][date] = 0;
            if(!mappedUpdates["Total"][date]) mappedUpdates["Total"][date] = 0;
            mappedUpdates["Total"][date] += parseInt(update.count);
            mappedUpdates[name][date] += parseInt(update.count);
        })

    let userUpdates = mappedUpdates[user] || {};
    const options = {
        devicePixelRatio: 4,
        responsive: true,
        maintainAspectRatio: false,
        tension: 0.1,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {},
        scales:{}
    }

    const graphData = {
        labels: Object
            .keys(userUpdates)
            .map((date)=> date.split("-")
            .splice(1,2)
            .join("-")),
        datasets: [
            {
                label: user,
                data: Object.values(userUpdates),
                fill: false,
                backgroundColor: colorScheme.red,
                borderColor: colorScheme.red,
            },
            {
                label: "Trend",
                data: smoothData(Object.values(userUpdates),resolution),
                fill: false,
                backgroundColor: colorScheme.blue,
                borderColor: colorScheme.blue,
            }
        ]
    }
    return (
        <GraphWithStatCard
            isLoading={updates.length === 0}
            title={"Surplus Template Approvals Yearly View"}
            dateInput={
            <NativeSelect
                mt={"xl"}
                mb={"xl"}
                label={"User"}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                >
                {Object
                    .keys(mappedUpdates)
                    .map((name) => {
                    if(ignoredNames.includes(name)) return null;
                    return <option key={name} value={name}>{name}</option>
                    })
                }
            </NativeSelect>
            }
            slotOne={
                <YearPickerInput
                    mt={"xl"}
                    mb={"xl"}
                    label={"Year"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            slotTwo={
                <Tooltip label={"The higher the resolution, the smoother the trend line."}>
                    <span>
                        <Text ml={"xs"} mt={"xl"}>Trend Line Resolution</Text>
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
                <StatCard
                    key={1}
                    stat={{
                        title: "Total Approvals",
                        value: graphData.datasets[0].data.reduce((a,b) => a + b, 0)
                    }}
                />
            ]}
            >
            <Line data={graphData} options={options} />
        </GraphWithStatCard>
    )
};

export default ApprovalsView;