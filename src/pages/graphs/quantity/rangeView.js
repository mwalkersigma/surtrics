// import React, {useState} from 'react';
// import useUpdates from "../../../modules/hooks/useUpdates";
//
//
// import makeDateArray from "../../../modules/utils/makeDateArray";
//
// import {colorScheme} from "../../_app";
// import {useMantineColorScheme} from "@mantine/core";
// import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
// import {DatePickerInput} from "@mantine/dates";
// import useUsage from "../../../modules/hooks/useUsage";
// import BaseChart from "../../../components/Chart";
// import StatCard from "../../../components/mantine/StatCard";
// import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
//
//
// let colorPalette = [
//     colorScheme.blue,
//     colorScheme.green,
//     colorScheme.red,
// ]
//
//

// const WeeklyView = () => {
//     useUsage("Metrics", "quantity-weekly-chart")
//     const [date, setDate] = useState(new Date());
//     let quantity = useUpdates("/api/views/quantity/weeklyViewTotalOnly", {startDate:findStartOfWeek(date),endDate:date});
//     console.log(quantity)
//     const {colorScheme: theme} = useMantineColorScheme();
//
//     if(quantity.length === 0) return 'loading...';
//     quantity = quantity.map((quantity) => ({...quantity, date: quantity.date.split("T")[0]}));
//
//     const names = [...new Set(quantity.map(({name}) => name))];
//     const dateArr = makeDateArray(date);
//
//
//     names.forEach((name) => {
//         dateArr.forEach((date) => {
//             const found = quantity.find((quantity) => quantity.name === name && quantity.date === date);
//             if (!found) quantity.push({name, date: date, sum: null})
//         })
//     })
//
//     const dataForGraph = names.reduce((acc, cur) => {
//         if (!acc[cur]) acc[cur] = [];
//         dateArr.forEach((date) => {
//             const found = quantity.find((quantity) => quantity.name === cur && quantity.date === date);
//             acc[cur].push(found?.sum)
//         })
//         return acc
//     }, {})
//
//
//     let max = Object
//         .values(dataForGraph)
//         .map(arr => arr.map(item => +item))
//         .reduce((acc, cur) => {
//             cur.forEach((item, i) => {
//                 acc[i] += item;
//             })
//             return acc
//         }, [0, 0, 0, 0, 0, 0, 0])
//     max = Math.ceil(Math.max(...max) * 2)
//     const options = {
//         plugins: {
//             tooltip: {
//                 color: parseTheme(theme),
//                 callbacks: {
//                     footer: (context) => {
//                         return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
//                     }
//                 }
//
//             },
//             datalabels: {
//                 color: parseTheme(theme),
//             },
//
//         },
//         scales: {
//             y: {
//                 max: max
//             }
//         }
//     }
//     const data = {
//         labels: dateArr,
//         datasets: Object.entries(dataForGraph).map(([name, graphData], i) => {
//             return {
//                 label: name,
//                 data: graphData,
//                 backgroundColor: colorPalette[i % 3],
//                 borderColor: colorPalette[i % 3],
//                 borderWidth: 1,
//                 stack: 1,
//                 type: "bar"
//             }
//         })
//     };
//     console.log(
//         quantity
//
//     )
//     return (
//         <GraphWithStatCard
//             title={"Surplus Quantity Weekly View"}
//             isLoading={quantity.length === 0}
//             dateInput={
//                 <DatePickerInput
//                     mb={"xl"}
//                     label={"Date"}
//                     value={date}
//                     onChange={(e) => setDate(e)}
//                 />
//             }
//             cards={[
//                 {value: quantity.reduce((acc, {sum}) => (acc + +sum), 0), title: "Total Quantity"},
//                 {value: quantity.reduce((acc, {sum}) => (acc + +sum), 0) / quantity.filter(({sum})=>sum).length, title: "Average Quantity"},
//                 {
//                     title: "Best Day",
//                     value: Math.max(...quantity.map(({sum}) => sum)),
//                     subtitle: quantity
//                         .filter(({sum})=>sum)
//                         .find(({sum})=> Number(sum) === Math.max(...quantity.map(({sum})=>Number(sum))))
//                         .name
//                 },
//
//
//             ].map((stat,i)=> <StatCard key={i} stat={stat} />)}
//         >
//             <BaseChart stacked data={data} config={options}/>
//         </GraphWithStatCard>
//     )
//
// };
//
// export default WeeklyView;


import React, {useState} from 'react';
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {NativeSelect, useMantineColorScheme} from "@mantine/core";
import useUsage from "../../../modules/hooks/useUsage";
import {colorScheme} from "../../_app";
import BaseChart from "../../../components/Chart";
import StatCard from "../../../components/mantine/StatCard";

const parseTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;
const RangeView = () => {
    useUsage("Metrics", "quantity-weekly-chart")
    const [[startDate, endDate], setDates] = useState([new Date('12-01-2023'), new Date('12-31-2023')]);
    const [interval, setInterval] = useState('week');
    const quantities = useUpdates("/api/views/quantity/totalOnly", {startDate: startDate, endDate: endDate,interval});

    const {colorScheme: theme} = useMantineColorScheme();

    const names = [...new Set(quantities.map(({name}) => name))];
    const dates = [...new Set(quantities.map(({date}) => date))].sort((a, b) => new Date(a) - new Date(b));

    names.forEach((name) => {
        dates.forEach((date) => {
            const found = quantities.find((quantity) => quantity.name === name && quantity.date === date);
            if (!found) quantities.push({name, date: date, sum: null})
        })
    })

    const dataForGraph = names.reduce((acc, cur) => {
        if (!acc[cur]) acc[cur] = [];
        dates.forEach((date) => {
            const found = quantities.find((quantity) => quantity.name === cur && quantity.date === date);
            acc[cur].push(found?.sum)
        })
        return acc
    }, {})

    let max = Object
        .values(dataForGraph)
        .map(arr => arr.map(item => +item))
        .reduce((acc, cur) => {
            cur.forEach((item, i) => {
                acc[i] += item;
            })
            return acc
        }, [0, 0, 0, 0, 0, 0, 0])
    max = Math.ceil(Math.max(...max) * 2)

    const options = {
        plugins: {
            tooltip: {
                color: parseTheme(theme),
                callbacks: {
                    footer: (context) => {
                        return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
                    }
                }
            },
            datalabels: {
                color: parseTheme(theme),
            },
        },
        scales: {
            y: {
                max: max
            }
        }
    }

    const data = {
        labels: dates.map((date) => new Date(date).toLocaleDateString()),
        datasets: Object.entries(dataForGraph).map(([name, graphData], i) => {
            return {
                label: name,
                data: graphData,
                backgroundColor: colorScheme.byIndex(i),
                borderColor: colorScheme.byIndex(i),
                borderWidth: 1,
                stack: 1,
                type: "bar"
            }
        })
    };




    return (
        <GraphWithStatCard
            title={"Surplus Quantity Range View"}
            dateInput={
                <CustomRangeMenu
                    subscribe={setDates}
                    defaultValue={[startDate, endDate]}
                    label={"Date Range"}
                    mb={'xl'}
                />
            }
            slotOne={
                <NativeSelect
                    label={"Interval"}
                    placeholder={"Select an interval"}
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    data={[
                        {value: 'day', label: 'Daily'},
                        {value: 'week', label: 'Weekly'},
                        {value: 'month', label: 'Monthly'},
                        {value: 'quarter', label: 'Quarterly'},
                        {value: 'year', label: 'Yearly'},
                    ]}
                />
            }
            cards={[
                {value: quantities.reduce((acc, {sum}) => (acc + +sum), 0), title: "Total Quantity"},
                {value: quantities.reduce((acc, {sum}) => (acc + +sum), 0) / quantities.filter(({sum})=>sum).length, title: "Average Quantity"},
                {
                    title: `Best ${interval}`,
                    value: Math.max(...quantities.map(({sum}) => sum)),
                    subtitle: quantities
                        .filter(({sum})=>sum)
                        .find(({sum})=> Number(sum) === Math.max(...quantities.map(({sum})=>Number(sum))))
                        ?.name

                },
            ].map((stat,i)=> <StatCard key={i} stat={stat} />)}
        >
            <BaseChart stacked data={data} config={options}/>
        </GraphWithStatCard>
    );
};

export default RangeView;