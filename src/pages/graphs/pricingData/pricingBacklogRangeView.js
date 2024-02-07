import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import BaseChart from "../../../components/Chart";
import {colorScheme} from "../../_app";
import React from "react";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import formatter from "../../../modules/utils/numberFormatter";
import StatCard from "../../../components/mantine/StatCard";

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
            //noBorder
            dateInput={
                <CustomRangeMenu
                    subscribe={setDateRange}
                    defaultValue={[startDate, endDate]}
                    mb={'xl'}
                    label={'Date Range'}
                />
            }
            cards={[
                {
                    title:"Current Pricing Backlog",
                    value:updates[updates.length - 1].count,
                    format:'number',
                },
                {
                    title:"Average Daily Change",
                    value: updates.reduce((acc,update,index)=>{
                        if(index === 0) return 0;
                        return acc + (update.count - updates[index-1].count)
                    }
                    ,0) / updates.length,
                    format:'number',
                }
            ].map((card,index)=>(<StatCard key={index} stat={card}/>))}
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
                        },
                    ],
                }}

            />
        </GraphWithStatCard>
    );
};

export default PricingBacklog;