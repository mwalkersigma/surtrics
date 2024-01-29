import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import BaseChart from "../../../components/Chart";
import {colorScheme} from "../../_app";
import React from "react";

const PricingBacklog = () => {
    const updates = useUpdates('/api/views/pricingBacklog',{
        startDate: '2023-01-01',
        endDate: '2024-01-31'
    });
    updates.sort((a,b)=>a['date_entered']-b['date_entered']);

    return (
        <GraphWithStatCard
            title={"Pricing Backlog"}
            noBorder
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