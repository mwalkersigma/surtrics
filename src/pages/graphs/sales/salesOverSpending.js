import React, {useState} from 'react';
import {subMonths} from "date-fns";
import useUpdates from "../../../modules/hooks/useUpdates";
import formatter from "../../../modules/utils/numberFormatter";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {NativeSelect, Slider, Text, Tooltip} from "@mantine/core";
import StatCard from "../../../components/mantine/StatCard";
import BaseChart from "../../../components/Chart";
import {colorScheme} from "../../_app";
import useOrders from "../../../modules/hooks/useOrders";
import smoothData from "../../../modules/utils/graphUtils/smoothData";
import {useDebouncedValue, useLogger} from "@mantine/hooks";
import useUsage from "../../../modules/hooks/useUsage";




const storeNames = {
    "225004": "Big Commerce",
    "255895": "Ebay",
};





const SalesOverSpending = () => {
    let count = 0;
    useUsage("Ecommerce","sales-Range-SalesOverSpending")
    const [timeScale,setTimeScale] = useState("week");
    const [[startDate,endDate],setDateRange] = useState([subMonths(new Date(),1),new Date()]);
    const [resolution, setResolution] = useState(8);
    const [debounced] = useDebouncedValue(resolution, 500);
    useLogger("Sales Vs Purchases: Trend Line Resolution Factor",[debounced])
    const quickBooksUpdates = useUpdates("/api/views/quickbooks",{startDate,endDate,timeScale});
    let salesUpdates = useOrders({startDate,endDate,timeScale},{acceptedConditions: ["1", "2", "3", "4"]});

    let orders = salesUpdates.reduce((acc,order)=>{
        let [yyyy,mm,dd] = order.timeStamp.split("T")[0].split("-");
        let date = `${mm}/${dd}/${yyyy}`;

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

    let dates = [...new Set(Object.values(orders).map((store)=>Object.keys(store)).flat())]
        .sort((a,b)=>new Date(a) - new Date(b));


    let maxOrders = Object.values(orders).reduce((acc,store)=>{
        let max = Math.max(...Object.values(store));
        return max > acc ? max : acc;
    },0);

    orders = Object
        .entries(orders)
        .map(([storeId,value])=>{
            if(storeId === "64872" || storeId === 64872) return;
            count++
            return ({
                type:"bar",
                label:storeNames[storeId],
                data:dates.map((date)=>value[date] || 0),
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

    let maxPurchases = Object.values(purchases).reduce((acc,purchase)=>{
        let max = Math.max(...Object.values(purchase));
        return max > acc ? max : acc;
    },0);

    purchases = Object
        .entries(purchases)
        .map(([purchaseType,value])=>{

            count++
            return ({
                type:"bar",
                label:purchaseType,
                data:dates.map((date)=> +value[date] || 0),
                backgroundColor:colorScheme.byIndex(count),
                stack:"stack1",
                order:2
            })
        })
        .filter((purchase)=>purchase !== undefined)



    let totalSales = salesUpdates.reduce((acc,order)=>acc + +order.total,0);
    let totalPurchases = quickBooksUpdates.reduce((acc,purchase)=>acc + +purchase.purchase_total,0);


    let max =Math.round(Math.max(maxOrders,maxPurchases) * 2);

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
                    label: (context)=> {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if(label.includes("trend")) return '';
                        return label + formatter(context.raw,'currency');
                    },
                    footer: (context)=> {
                        let salesTotal = 0;
                        let purchaseTotal = 0;
                        let salesCategories = ["Big Commerce","Ebay"];
                        let purchaseCategories = ["Auction", "List Buy", "N/A", "Non-List"];
                        let validCategories = [...salesCategories,...purchaseCategories];

                        context.forEach(({datasetIndex,raw})=>{
                            let label = context[datasetIndex]?.dataset.label;
                            if(!validCategories.includes(label)) return;
                            if(!salesCategories.includes(label)){
                                salesTotal += +raw;
                            }
                            if(!purchaseCategories.includes(label)){
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
        scales: {
            y: {
                max
            }
        },
    };

    function stackData (arr){
        return arr[0]?.data.map((item,index)=>{
            arr.slice(1).forEach((order,)=> {
                item += order.data[index] ?? 0;
            });
            return item;
        });
    }

    return (
        <GraphWithStatCard
            title={"Sales Over Spending Range View"}
            isLoading={salesUpdates.length === 0}
            dateInput={
                <CustomRangeMenu
                    label={"Date Range"}
                    mt={"xl"}
                    mb={"xl"}
                    subscribe={setDateRange}
                    defaultValue={[startDate,endDate]}
                />
            }
            slotOne={
                <NativeSelect
                    label={"Time Scale"}
                    value={timeScale}
                    mt={"xl"}
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
                        <Text ml={"xs"} mt={"xl"}>Trend Line Resolution</Text>
                        <Slider
                            mb={"xl"}
                            ml={"xs"}
                            color="blue"
                            marks={[
                                { value: 0, label: 'none' },
                                { value: 2, label: '2' },
                                { value: 4, label: '4' },
                                { value: 6, label: '6' },
                                { value: 8, label: 'linear' },
                            ]}
                            min={0}
                            max={8}
                            value={resolution}
                            onChange={(e) => setResolution(e)}
                        />
                    </span>
                </Tooltip>
            }
            cards={[
                {title:"Total Sales For Selection", value:totalSales, format:'currency'},
                {title:"Total Purchases For Selection", value:totalPurchases,format:'currency'},

            ].map((card,index)=>(<StatCard key={index} stat={card}/>))
            }
        >
            <BaseChart
                data={{
                    labels:dates,
                    datasets:[
                        {
                            type:"line",
                            label:"Sales trend",
                            data:smoothData(stackData(orders),debounced),
                            fill: false,
                            backgroundColor: colorScheme.green,
                            borderColor: colorScheme.green,

                        },
                        {
                            type:"line",
                            label:"Purchases trend",
                            data:smoothData(stackData(purchases),debounced),
                            fill: false,
                            backgroundColor: colorScheme.red,
                            borderColor: colorScheme.red,

                        },
                        ...purchases,
                        ...orders,
                    ]
                }}
                stacked
                config={options}
            />
        </GraphWithStatCard>
    );
};

export default SalesOverSpending;