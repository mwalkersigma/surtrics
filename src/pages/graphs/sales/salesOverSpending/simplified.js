import React, {useState} from 'react';
import {subMonths} from "date-fns";
import useUpdates from "../../../../modules/hooks/useUpdates";
import formatter from "../../../../modules/utils/numberFormatter";
import GraphWithStatCard from "../../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../../components/mantine/customRangeMenu";
import {
    NativeSelect,
    Paper,
    Progress,
    ProgressRoot,
    Slider,
    Text,
    Tooltip,
    useMantineColorScheme,
    useMantineTheme
} from "@mantine/core";
import StatCard from "../../../../components/mantine/StatCard";
import BaseChart from "../../../../components/Chart";
import {colorScheme} from "../../../_app";
import useOrders from "../../../../modules/hooks/useOrders";
import smoothData from "../../../../modules/utils/graphUtils/smoothData";
import {useDebouncedValue, useLogger} from "@mantine/hooks";
import useUsage from "../../../../modules/hooks/useUsage";
import colorizeLine from "../../../../modules/utils/colorizeLine";




const storeNames = {
    "225004": "Big Commerce",
    "255895": "Ebay",
};

const shortNames = {
    "Big Commerce": "BC",
    "Ebay": "EBAY",
}

const targetList = {
    "day": "daily",
    "week": "weekly",
    "month": "monthly",
    "quarter": "monthly",
    "year": "yearly",

}




const Simplified = () => {
    useUsage("Ecommerce","sales-Range-Index-simple")
    const {colorScheme} = useMantineColorScheme();
    console.log(colorScheme)
    const [timeScale,setTimeScale] = useState("week");
    const [[startDate,endDate],setDateRange] = useState([subMonths(new Date(),1),new Date()]);

    const quickBooksUpdates = useUpdates("/api/views/quickbooks",{startDate,endDate,timeScale});
    let salesUpdates = useOrders({startDate,endDate,timeScale},{acceptedConditions: ["1", "2", "3", "4"]});

    let orders = salesUpdates.reduce((acc,order)=>{
        let [yyyy,mm,dd] = order.timeStamp.split("T")[0].split("-");
        let date = `${mm}/${dd}/${yyyy}`;
        if(!acc[order.storeId]){

        }
        acc["total"] = acc["total"] || {};
        acc["total"][date] = acc["total"][date] || 0;
        acc["total"][date] += Number(order.total);
        return acc;
    },{})


    let dates = [...new Set(Object.values(orders).map((store)=>Object.keys(store)).flat())]
        .sort((a,b)=>new Date(a) - new Date(b));



    const orderGraphs = Object
        .values(orders)
        .map((value)=>{
            return ({
                type:"bar",
                label:"Sales",
                data:dates.map((date)=>value[date] || 0),
                order:1
            })
        })
        .filter((order)=>order !== undefined)



    let purchases = quickBooksUpdates.reduce((acc,purchase)=>{
        let [yyyy,mm,dd] = purchase.po_date.split("T")[0].split("-");
        let date = `${mm}/${dd}/${yyyy}`;

        acc["total"] = acc["total"] || {};
        acc["total"][date] = acc["total"][date] || 0;
        acc["total"][date] += Number(purchase.purchase_total);

        return acc
    },{});



    const purchaseGraphs = Object
        .values(purchases)
        .map((value)=>{
            return ({
                type:"bar",
                label:"Purchases",
                data:dates.map((date)=> +value[date] || 0),
                order:2
            })
        })
        .filter((purchase)=>purchase !== undefined)


    let totalSales = salesUpdates.reduce((acc,order)=>acc + +order.total,0);
    let totalPurchases = quickBooksUpdates.reduce((acc,purchase)=>acc + +purchase.purchase_total,0);

    let max = [orders,purchases]
        .filter((value)=>Object.keys(value).length > 0)
        .map(({total})=> Object
            ?.values(total))
            ?.flat()
            ?.reduce((acc,curr)=>Math.max(acc,curr),0) * 1.5;
        max = Math.floor(max / 1000) * 1000;



    const options = {
        plugins: {
            legend: {
                position: 'top',
                labels:{
                    borderRadius: 10,
                    usePointStyle: true,
                }
            },
            datalabels: {
                color: colorScheme === "dark" ? "white" : "black",
                fontWeight: 'bold',
                formatter: (v)=>formatter(v,'currency'),
                display: true,
                borderRadius: 10,
            },
        },
        scales: {
            y: {
                max
            }
        },
    };


    return (
        <GraphWithStatCard
            title={"Sales Over Spending Range View"}
            isLoading={salesUpdates.length === 0}
            dateInput={
                <CustomRangeMenu
                    label={"Date Range"}
                    mb={"xl"}
                    subscribe={setDateRange}
                    defaultValue={[startDate,endDate]}
                />
            }
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
            cards={[...[
                {title:"Total Sales For Selection", value:totalSales, format:'currency'},
                {title:"Total Purchases For Selection", value:totalPurchases,format:'currency'},

            ].map((card,index)=>(<StatCard key={index} stat={card}/>))
            ]}
        >
            <BaseChart
                customColors
                data={{
                    labels:dates,
                    datasets:[
                        ...purchaseGraphs,
                        ...orderGraphs,
                    ]
                }}
                stacked
                config={options}
            />
        </GraphWithStatCard>
    );
};

export default Simplified;