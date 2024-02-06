import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import BaseChart from "../../../components/Chart";
import {colorScheme} from "../../_app";
import React from "react";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";

const PricingBacklog = () => {
    const [[startDate, endDate], setDateRange] = React.useState([new Date('2023-01-01'), new Date('2024-01-31')]);
    let updates = useUpdates('/api/views/pricingBacklog',{
        startDate,
        endDate
    });
    updates.sort((a,b)=>new Date(a['date_entered'])- new Date(b['date_entered']));

    return (
        <GraphWithStatCard
            title={"Pricing Backlog"}
            noBorder
            dateInput={
                <CustomRangeMenu
                    subscribe={setDateRange}
                    defaultValue={[startDate, endDate]}
                    mb={'xl'}
                    label={'Date Range'}
                />
            }
        >
            <BaseChart
                data={{
                    labels: updates.map(({date_entered})=>new Date(date_entered).toLocaleDateString()),
                    datasets: [
                        {
                            type: 'line',
                            label: 'Pricing Backlog',
                            data: updates.map(({count})=>count),
                            fill: false,
                            backgroundColor: colorScheme.red,
                            borderColor: colorScheme.red,
                        },
                    ],
                }}
            />
        </GraphWithStatCard>
    );
};

export default PricingBacklog;