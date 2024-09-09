import React, {useState} from 'react';
import useOrders from "../../../../modules/hooks/useOrders";
import GraphWithStatCard from "../../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../../components/mantine/customRangeMenu";
import {subDays} from "date-fns";
import formatter from "../../../../modules/utils/numberFormatter";
import BaseChart from "../../../../components/Chart";
import {useDebouncedValue} from "@mantine/hooks";
import {NativeSelect, Slider, Text, Tooltip} from "@mantine/core";
import smoothData from "../../../../modules/utils/graphUtils/smoothData";
import colorizeLine from "../../../../modules/utils/colorizeLine";
import {colorScheme} from "../../../_app";
import useEvents from "../../../../modules/hooks/useEvents";

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
    const [timeScale, setTimeScale] = useState("week");
    const [[startDate, endDate], setDateRange] = useState([subDays(new Date(), 30), new Date()])
    const [resolution, setResolution] = useState(4);
    const [debounced] = useDebouncedValue(resolution, 500);

    const data = useOrders({
        startDate,
        endDate,
        timeScale
    });
    let {reducedEvents} = useEvents({
        startDate,
        endDate,
        timeScale,
        excludedCategories: [
            'Processing',
            'Warehouse'
        ],
    });

    // let reducedEvents = () => [];

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
            {
                type: "line",
                label: "Sales trend",
                data: smoothData(orders, debounced),
                segment: {
                    borderColor: colorizeLine({up: 'limeGreen', down: 'red', unchanged: 'blue'})
                },
                backgroundColor: colorScheme.blue,
                fill: false,

            },
        ]
    }
    return (
        <GraphWithStatCard
            dateInput={<CustomRangeMenu label={'date range'} subscribe={setDateRange}
                                        defaultValue={[startDate, endDate]}/>}
            slotOne={
                <NativeSelect
                    label={"Time Scale"}
                    value={timeScale}
                    mb={"xl"}
                    onChange={(e) => setTimeScale(e.target.value)}
                >
                    <option value={"day"}>Day</option>
                    <option value={"week"}>Week</option>
                    <option value={"month"}>Month</option>
                    <option value={"quarter"}>Quarter</option>
                    <option value={"year"}>Year</option>
                </NativeSelect>
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
            title={"Orders"}
        >
            <BaseChart events={reducedEvents(dates)} options={options} data={dataForChart}/>
        </GraphWithStatCard>
    );
};

export default Index;