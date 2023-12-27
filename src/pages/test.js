import React, {useState} from 'react';
import useUpdates from "../modules/hooks/useUpdates";
import Order from "../modules/classes/Order";
import {setDate} from "date-fns";
import GraphWithStatCard from "../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../components/mantine/customRangeMenu";
import {NativeSelect} from "@mantine/core";
import {colorScheme} from "./_app";
import BaseChart from "../components/Chart";
import StatCard from "../components/mantine/StatCard";
import formatter from "../modules/utils/numberFormatter";

function useSales({startDate,endDate,timeScale}) {
    let salesUpdates = useUpdates("/api/views/sales",{startDate,endDate,timeScale});
    salesUpdates = salesUpdates.map(sale => new Order(sale));
    return salesUpdates;
}

const storeNames = {
    "225004": "Big Commerce",
    "255895": "Ebay",
};





const Test = () => {
    let count = 0;
    let testMonth = new Date('2023-08-30');
    const [timeScale,setTimeScale] = useState("week");
    const [[startDate,endDate],setDateRange] = useState([setDate(testMonth,1),testMonth])
    const quickBooksUpdates = useUpdates("/api/views/quickbooks",{startDate,endDate,timeScale});
    let salesUpdates = useSales({startDate,endDate,timeScale});

    let orders = salesUpdates.reduce((acc,order)=>{

        let date = order.paymentDate;
        if(!acc[order.storeId]){
            acc[order.storeId] = {}
        }
        if(!acc[order.storeId][date]){
            acc[order.storeId][date] = 0;
        }
        acc[order.storeId][date] += order.total;
        acc[order.storeId][date] = Math.round(acc[order.storeId][date] * 100) / 100;
        return acc;
    },{})
    let dates = [...new Set(Object.values(orders).map((store)=>Object.keys(store)).flat())].sort((a,b)=>new Date(a) - new Date(b));
    orders = Object
        .entries(orders)
        .map(([storeId,dates])=>{
            if(storeId === "64872" || storeId === 64872) return;
            count++
            return ({
                type:"bar",
                label:storeNames[storeId],
                data:Object.values(dates).map((total)=>total),
                backgroundColor:colorScheme.byIndex(count),
                stack:"stack0",
                order:1
            })
        })
        .filter((order)=>order !== undefined)


    let purchases = quickBooksUpdates.reduce((acc,purchase)=>{
        let [yyyy,mm,dd] = purchase.po_date.split("T")[0].split("-");
        let date = `${mm}/${dd}/${yyyy}`;
        if(!acc[purchase.purchase_type]){
            acc[purchase.purchase_type] = {}
        }
        if(!acc[purchase.purchase_type][date]){
            acc[purchase.purchase_type][date] = 0;
        }
        acc[purchase.purchase_type][date] += +purchase.purchase_total;
        return acc
    },{});
    purchases = Object
        .entries(purchases)
        .map(([purchaseType,dailyBuys])=>{
            count++
            return ({
                type:"bar",
                label:purchaseType,
                data:dates.map((date)=>dailyBuys[date] || 0),
                backgroundColor:colorScheme.byIndex(count),
                stack:"stack1",
                order:2
            })
        })
        .filter((purchase)=>purchase !== undefined)



    const options = {
        plugins: {
            legend: {
                position: 'top',
                labels:{
                    borderRadius: 10,
                    usePointStyle: true,
                }
            },
            tooltip: {
                callbacks: {
                    footer: (context)=> {
                        let salesTotal = 0;
                        let purchaseTotal = 0;
                        let salesCategories = ["Big Commerce","Ebay"];
                        let purchaseCategories = ["Auction", "List Buy", "N/A", "Non-List"];


                        context.forEach(({datasetIndex,raw})=>{
                            console.log(context[datasetIndex]);
                            if(salesCategories.includes(context[datasetIndex].dataset.label)){
                                salesTotal += +raw;
                            }
                            if(purchaseCategories.includes(context[datasetIndex].dataset.label)){
                                purchaseTotal += +raw;
                            }
                        });

                        let str = '';
                        str += `Sales: ${formatter(salesTotal,'currency')}\n`;
                        str += `Purchases: ${formatter(purchaseTotal,'currency')}\n`;

                        return str;
                    }
                }
            }
        },
    };

    let totalSales = salesUpdates.reduce((acc,order)=>acc + +order.total,0);
    let totalPurchases = quickBooksUpdates.reduce((acc,purchase)=>acc + +purchase.purchase_total,0);
    let totalProfit = totalSales - totalPurchases;
    //let profitMargin = totalProfit / totalSales;



    return (
        <GraphWithStatCard
            title={"Sales Over Spending Range View"}
            isLoading={salesUpdates.length === 0 || quickBooksUpdates.length === 0}
            dateInput={
                <CustomRangeMenu
                    label={"Date Range"}
                    mb={'xl'}
                    subscribe={setDateRange}
                    defaultValue={[startDate,endDate]}
                />
            }
            slotOne={
                <NativeSelect
                    label={"Time Scale"}
                    value={timeScale}
                    onChange={(e) => setTimeScale(e.target.value)}
                >
                    <option value={"day"}>Day</option>
                    <option value={"week"}>Week</option>
                    <option value={"month"}>Month</option>
                    <option value={"quarter"}>Quarter</option>
                    <option value={"year"}>Year</option>
                </NativeSelect>
            }
            cards={[
                {title:"Total Sales For Selection", value:totalSales, format:'currency'},
                {title:"Total Purchases For Selection", value:totalPurchases,format:'currency'},

            ].map((card,index)=>(<StatCard key={index} stat={card}/>))
        }
        >
            <BaseChart
                data={{
                labels:dates, datasets:[...purchases,...orders]
            }}
                stacked
                config={options}
            />
        </GraphWithStatCard>
    );
};

export default Test;