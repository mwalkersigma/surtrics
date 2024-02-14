// import React, {useState} from 'react';
//
// import useUpdates from "../../../modules/hooks/useUpdates";
//
// import formatter from "../../../modules/utils/numberFormatter";
// import {colorScheme} from "../../_app";
// import {useMantineColorScheme} from "@mantine/core";
// import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
// import {DatePickerInput} from "@mantine/dates";
// import useUsage from "../../../modules/hooks/useUsage";
// import BaseChart from "../../../components/Chart";
// import StatCard from "../../../components/mantine/StatCard";
//
//
//
//
//
//
//
//
//
//
// function IndividualChart(props){
//     let {individualData,theme} = props;
//     const useTheme = theme => theme === "dark" ? colorScheme.white : colorScheme.dark;
//
//     const options = {
//         plugins: {
//             tooltip: {
//                 callbacks: {
//                     label: (context) => {
//                         if(context.raw === 0) return "";
//                         return context.dataset.label + ": " + formatter(context.raw);
//                     },
//                     footer: (context)=> {
//                         return "TOTAL: " + context.reduce((acc, {raw}) => (acc + +raw), 0);
//                     }
//                 }
//             },
//             legend: {
//                 position: "top",
//                 align: "center",
//                 labels: {
//                     boxWidth: 30,
//                     usePointStyle: true,
//                     color: useTheme(theme)+"A",
//                 },
//             },
//             datalabels: {
//                 color: colorScheme.white,
//                 display: (context) => context.dataset.data[context.dataIndex] > 200,
//                 font: {
//                     weight: "bold",
//                 },
//                 formatter: Math.round
//             },
//         },
//         scales: {
//             y: {
//                 stacked: true,
//             },
//             x:{
//                 stacked: true,
//             }
//         },
//     }
//     try{
//     let dataForChart = JSON.parse(individualData);
//     let types = new Set();
//     Object
//         .values(dataForChart)
//         .forEach(user=>{
//             Object
//                 .keys(user)
//                 .forEach(key => types.add(key));
//         })
//     const data = individualData.length > 0 && {
//         labels: Object.keys(dataForChart),
//         datasets:
//         types.size > 0 && [...types].map((type)=> {
//             if(type === 'Create -'){
//                 return {
//                     type: "bar",
//                     label: type,
//                     data: Object.values(dataForChart).map((user) => +user[type] / 4  || 0) ,
//                     maxBarThickness: 100,
//                 }
//             }
//             return {
//                 type: "bar",
//                 label: type,
//                 data: Object.values(dataForChart).map((user) => user[type] || 0),
//                 maxBarThickness: 100,
//             }
//         })
//     };
//     return <BaseChart stacked data={data}  config={options}/>
//
//     }catch (e) {
//         return null;
//     }
// }
//
//
//
//
// function UserGraph() {
//     useUsage("Metrics","individual-daily-chart")
//     const [date, setDate] = useState(new Date());
//     let individualData = useUpdates("/api/views/individualView", {date});
//     const {colorScheme: theme} = useMantineColorScheme();
//
//     return (
//         <GraphWithStatCard
//             title={"Individual Daily Chart"}
//             isLoading={individualData.length === 0}
//             dateInput={
//                 <DatePickerInput
//                     mb={"xl"}
//                     label={"Date"}
//                     value={date}
//                     onChange={(e) => setDate(e)}
//                 />
//             }
//             cards={[
//                 {
//                     title: "Users",
//                     value: individualData && Object.keys(JSON.parse(individualData)).length,
//                     description: "Total number of users"
//                 }
//             ].map((stat,i)=> <StatCard key={i} stat={stat} />)}>
//             <IndividualChart theme={theme} individualData={individualData} date={date}/>
//         </GraphWithStatCard>
//     )
// }
//
// export default UserGraph;


import React from 'react';

const IndividualGraph = () => {
    return (
        <div>
            This component is under construction
        </div>
    );
};

export default IndividualGraph;