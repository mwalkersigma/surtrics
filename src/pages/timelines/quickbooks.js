import React from "react";

import {setDate, setMonth} from "date-fns";
import {Text, Timeline, Group, Checkbox, ScrollArea} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";

import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Title as chartTitle,
    Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {IconGitBranch} from "@tabler/icons-react";
import formatter from "../../modules/utils/numberFormatter";
import useUpdates from "../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../components/mantine/customRangeMenu";
import useUsage from "../../modules/hooks/useUsage";

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

const EbayRangeView = () => {
    useUsage("Ecommerce","quickbooks-rangeView-timeline")
    const [dateRange, setDateRange] = React.useState([setDate(setMonth(new Date(),0),1), new Date()]) // [start, end]
    const [startDate,endDate] = dateRange;
    const [sortDirection,setSortDirection] = React.useState(true);
    let updates = useUpdates("/api/views/quickbooks",{startDate,endDate});

    sortDirection ? updates.sort((a,b) => new Date(a.po_date) - new Date(b.po_date)) : updates.sort((a,b) => new Date(b.po_date) - new Date(a.po_date))

    return (
        <GraphWithStatCard
            noBorder
            title={"Quickbooks Purchase Orders"}
            dateInput={
                <CustomRangeMenu
                    defaultValue={dateRange}
                    subscribe={setDateRange}
                />
            }
            slotTwo={
                <>
                    <Text
                        mb={'xs'}
                        onClick={() => setSortDirection(!sortDirection)}
                    >
                        Sort Direction: {sortDirection ? "ASC" : "DESC"}
                    </Text>
                    <Checkbox
                        mb={'xl'}
                        checked={sortDirection}
                        onChange={() => setSortDirection(!sortDirection)}
                        label={"Sort Direction"}
                    />
                </>
            }
        >
            <ScrollArea>
                <Timeline mt={'1rem'} ml={'1rem'} mb={'2rem'} bulletSize={24} lineWidth={2} >
                    {updates.map((event,i) => {
                        return (
                            <Timeline.Item key={i} bullet={<IconGitBranch size={12} />} title={event.po_name}>
                                <Group mb={'.3rem'}>
                                    <Text c="dimmed" size="sm" lineClamp={4}>{event.po_number}</Text>
                                    <Text c="dimmed" size="sm" lineClamp={4}>{event.purchase_type}</Text>
                                    <Text c="dimmed" size="sm" lineClamp={4}>{new Date(event.po_date).toLocaleDateString()}</Text>
                                </Group>
                                <Text mb={'.3rem'} c="dimmed" size="sm" lineClamp={4}>{formatter(event.purchase_total,'currency')}</Text>
                                <Text c="dimmed" size="sm" lineClamp={4}>Submitted by : {event.user_who_submitted}</Text>
                            </Timeline.Item>
                        )
                    })
                    }
                </Timeline>
            </ScrollArea>
        </GraphWithStatCard>
    );
};

export default EbayRangeView;