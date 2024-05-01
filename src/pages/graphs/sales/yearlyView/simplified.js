import React, {useState} from 'react';
import GraphWithStatCard from "../../../../components/mantine/graphWithStatCard";
import {YearPickerInput} from "@mantine/dates";

import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import {useMantineColorScheme} from "@mantine/core";
import {colorScheme} from "../../../_app";
import {lastDayOfYear, setDate, setMonth, startOfMonth} from "date-fns";

import useUsage from "../../../../modules/hooks/useUsage";

import useOrders from "../../../../modules/hooks/useOrders";

import formatter from "../../../../modules/utils/numberFormatter";
import BaseChart from "../../../../components/Chart";
import StatCard from "../../../../components/mantine/StatCard";
import compoundArray from "../../../../modules/utils/compoundArray";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    LineElement,
    DataLabels,
    PointElement,
);



const dateSet = setDate
const Index = () => {
    useUsage("Ecommerce", "sales-yearly-chart-simplified");
    const [date, setDate] = useState(setMonth(dateSet(new Date(),1),0));
    const theme = useMantineColorScheme();
    const themeColor = theme => theme !== "dark" ? colorScheme.white : colorScheme.dark;
    const orders = useOrders(
        {
            startDate:date,
            endDate:lastDayOfYear(date)
        },
        {
            acceptedConditions: ["1", "2", "3", "4"]
        });

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let yearTotal = 0;
    let orderCountTotal = 0;
    let yearSales = [];
    let orderCount = [];

    orders.forEach(order=>{
        if (new Date(order.paymentDate).getFullYear() !== date.getFullYear()) return;
        let month = Number(startOfMonth(new Date(order.paymentDate)).toLocaleDateString().split("/")[0]) - 1;


        if(!yearSales[month]){
            yearSales[month] = 0
        }
        let orderTotal = order.total;
        yearTotal += Number(orderTotal);
        yearSales[month] += Number(orderTotal);

        orderCountTotal += 1;

        if(!orderCount[month]){
            orderCount[month] = 0;
        }

        orderCount[month] += 1;

    });


    const dataSets = {
        labels: months,
        datasets: [
            {
                label: "Total Sales",
                data: compoundArray(yearSales),
                type: "bar",
            },
        ]
    }




    const options = {
        plugins: {
            tooltip: {
                enabled:false,
            },
            legend: {
                position: "top",
                align: "center",
                labels: {
                    boxWidth: 30,
                    usePointStyle: true,
                    color: themeColor(theme)+"A",
                },
            },
            datalabels: {
                color: colorScheme.white,
                display: (context) => context.dataset.data[context.dataIndex] > 200,
                font: {
                    size: 11,
                    weight: "bold",
                },
                formatter: (value) => formatter(value,'currency')
            },

        },
        scales: {
            y: {
                ticks: {
                    callback:(value)=> `${formatter(value,'currency')}`,
                },
                stacked: true,
                min:0,
                max: dataSets.datasets[0].data[dataSets.datasets[0].data.length - 1] * 1.6,
            },
            x:{
                stacked: true,
            }
        },
    };


    return (
        <GraphWithStatCard
            title={"Yearly Sales ( Compounded )"}
            dateInput={
                <YearPickerInput
                    mb={'md'}
                    label={"Year"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            cards={[
                <StatCard
                    key={0}
                    stat={{
                        title: "Total Sales",
                        value: yearTotal,
                        format:'currency'
                    }}
                />,
                <StatCard
                    key={1}
                    stat={{
                        title: "Total Orders",
                        value: orderCountTotal,
                        format:'number'
                    }}
                />,
            ]}
        >
            <BaseChart
                stacked
                data={dataSets}
                config={options}
            />
        </GraphWithStatCard>
    );
};

export default Index;
