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

import {colorScheme} from "../../_app";
import {lastDayOfYear, setDate, setMonth} from "date-fns";
import {YearPickerInput} from "@mantine/dates";
import {NativeSelect, Slider, Text, Tooltip} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import StatCard from "../../../components/mantine/StatCard";
import useUsage from "../../../modules/hooks/useUsage";
import BaseChart from "../../../components/Chart";
import useEvents from "../../../modules/hooks/useEvents";
import smoothData from "../../../modules/utils/graphUtils/smoothData";





ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    ChartTooltip,
    Legend,
    LineElement,
    PointElement,
);


const dateSet = setDate
const ApprovalsView = () => {
    useUsage("Metrics","Approvals-Yearly-chart")
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
        tension: 0.1,
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
                type:"line"
            },
            {
                label: "Trend",
                data: smoothData(Object.values(userUpdates),resolution),
                fill: false,
                backgroundColor: colorScheme.blue,
                borderColor: colorScheme.blue,
                type:"line"
            }
        ]
    }

    const {reducedEvents} = useEvents({
        startDate:date,
        endDate:lastDayOfYear(date),
        timeScale:'week',
        includedCategories:['Processing','Warehouse'],
        affected_categories:['Processing'],
    })

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
            <BaseChart events={reducedEvents(Object.keys(userUpdates || {}))} data={graphData} config={options} />
        </GraphWithStatCard>
    )
};

export default ApprovalsView;