import React, {useState} from 'react';
import useOrders from "../../../../modules/hooks/useOrders";
import GraphWithStatCard from "../../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../../components/mantine/customRangeMenu";
import {subDays} from "date-fns";
import formatter from "../../../../modules/utils/numberFormatter";
import BaseChart from "../../../../components/Chart";

const options = {
    plugins: {
        legend: {
            position: 'top',
            labels: {
                borderRadius: 10,
                usePointStyle: true,
            }
        },
        colors: {
            enabled: false,
            forceOverride: false
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (label.includes("trend")) return '';
                    return label + formatter(context.raw, 'currency');
                },
                footer: (context) => {
                    let salesTotal = 0;
                    let purchaseTotal = 0;
                    let salesCategories = ["Big Commerce", "Ebay"];
                    let purchaseCategories = ["Auction", "List Buy", "N/A", "Non-List"];
                    let validCategories = [...salesCategories, ...purchaseCategories];

                    context.forEach(({datasetIndex, raw}) => {
                        let label = context[datasetIndex]?.dataset.label;
                        if (!validCategories.includes(label)) return;
                        if (!salesCategories.includes(label)) {
                            salesTotal += +raw;
                        }
                        if (!purchaseCategories.includes(label)) {
                            purchaseTotal += +raw;
                        }
                    });

                    let str = '';
                    str += `Sales: ${formatter(salesTotal, 'currency')}\n`;
                    str += `Purchases: ${formatter(purchaseTotal, 'currency')}\n`;

                    return str;
                }
            }
        },
    },
    scales: {
        y: {}
    },
};

const Index = () => {

    const [[startDate, endDate], setDateRange] = useState([subDays(new Date(), 30), new Date()])
    const data = useOrders({
        startDate,
        endDate
    });

    if (!data.length > 0) return (
        <GraphWithStatCard
            dateInput={<CustomRangeMenu subscribe={setDateRange} defaultValue={[startDate, endDate]}/>}
            title={"Orders"}
        >
            <div>No data available</div>
        </GraphWithStatCard>
    );

    const dataByDate = Object.groupBy(data, ({paymentDate}) => paymentDate);
    const dates = Object.keys(dataByDate);
    const orders = dates.map(date => dataByDate[date].length);

    const dataForChart = {
        labels: dates,
        datasets: [
            {
                label: 'Orders',
                data: orders,
                fill: false,
                tension: 0.1,
                type: 'line',
            },
        ]
    }
    return (
        <GraphWithStatCard
            dateInput={<CustomRangeMenu subscribe={setDateRange} defaultValue={[startDate, endDate]}/>}
            title={"Orders"}
        >
            <BaseChart options={options} data={dataForChart}/>
        </GraphWithStatCard>
    );
};

export default Index;