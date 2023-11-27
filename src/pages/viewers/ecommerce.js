import React from 'react';
import {Flex, Grid, Group, Paper, SimpleGrid, Text, Title, Skeleton} from '@mantine/core';
import classes from '../../styles/StatsGrid.module.css';
import {addMonths, format, setDate, setISODay} from "date-fns";
import useUpdates from "../../modules/hooks/useUpdates";
import formatter from "../../modules/utils/numberFormatter";
import { MonthPickerInput} from '@mantine/dates';
import RoleWrapper from "../../components/RoleWrapper";
import StatCard from "../../components/mantine/StatCard";




function MasonryGrid({current,previous}){
    const currentMonthData = current;
    let previousMonthData = previous ? previous : {
        impressions:"No Data",
        page_views:"No Data",
        visits:"No Data",
        ebay_sales:"No Data",
    };
    const sections = [
        {
            title:"Ebay",
            stats:[
                {
                    stat:{
                        title:"Impressions",
                        diff: (currentMonthData.impressions - previousMonthData.impressions) / previousMonthData.impressions * 100,
                        value: currentMonthData.impressions,
                        subtitle:`Previous Month: ${formatter(previousMonthData.impressions)}`
                    },
                    Icon:"visits",
                },
                {
                    stat:{
                        title:"Page Views",
                        diff: (currentMonthData.page_views - previousMonthData.page_views) / previousMonthData.page_views * 100,
                        value: currentMonthData.page_views,
                        subtitle:`Conversion Rate: ${Math.trunc(currentMonthData.page_views / currentMonthData.impressions * 10000)/100}%`
                    },
                    Icon:"eye",
                },
                {
                    stat:{
                        title:"Ebay Sales Transactions",
                        diff: (currentMonthData.ebay_sales_transactions - previousMonthData.ebay_sales_transactions) / previousMonthData.ebay_sales_transactions * 100,
                        value: currentMonthData.ebay_sales_transactions,
                        subtitle:`Order Rate: ${Math.trunc(currentMonthData.ebay_sales_transactions / currentMonthData.page_views * 10000)/100}%`
                    },
                    Icon:"receipt",
                },
                {
                    stat:{
                        title:"Ebay Sales",
                        diff: (currentMonthData.ebaySales - previousMonthData.ebaySales) / previousMonthData.ebaySales * 100,
                        value: currentMonthData.ebaySales,
                        format:"currency",
                        subtitle:`Previous Month: ${formatter(previousMonthData.ebaySales,"currency")}`
                    },
                    Icon:"coin",
                },
            ]
        },
        {
            title:"Big Commerce",
            stats: [
                {
                    stat:{
                        title:"Visits",
                        diff: (currentMonthData.visits - previousMonthData.visits) / previousMonthData.visits * 100,
                        value: currentMonthData.visits,
                        subtitle:`Previous Month: ${formatter(previousMonthData.visits)}`
                    },
                    Icon:"eye",
                },
                {
                    stat:{
                        title: "Shopped",
                        diff: (currentMonthData.shopped - previousMonthData.shopped) / previousMonthData.shopped * 100,
                        value: currentMonthData.shopped,
                        subtitle:`Conversion Rate: ${Math.trunc(currentMonthData.shopped / currentMonthData.visits * 10000)/100}%`
                    },
                    Icon:"eye",
                },
                {
                    stat:{
                        title:"Add To Cart",
                        diff: (currentMonthData.add_to_cart - previousMonthData.add_to_cart) / previousMonthData.add_to_cart * 100,
                        value: currentMonthData.add_to_cart,
                        subtitle:`Order Rate: ${Math.trunc(currentMonthData.add_to_cart / currentMonthData.visits * 10000)/100}%`
                    },
                    Icon:"eye",
                },
                {
                    stat:{
                        title:"Transactions",
                        diff: (currentMonthData.big_commerce_transactions - previousMonthData.big_commerce_transactions) / previousMonthData.big_commerce_transactions * 100,
                        value: currentMonthData.big_commerce_transactions,
                        subtitle:`Close Rate: ${Math.trunc(currentMonthData.big_commerce_transactions / currentMonthData.add_to_cart * 10000)/100}%`
                    },
                    Icon:"receipt",
                },
                {
                    stat:{
                        title:"Web Leads",
                        diff: (currentMonthData.web_leads - previousMonthData.web_leads) / previousMonthData.web_leads * 100,
                        value: currentMonthData.web_leads,
                        subtitle:`Previous Month: ${formatter(previousMonthData.web_leads)}`
                    },
                    Icon:"receipt",
                },
                {
                    stat:{
                        title:"Sales",
                        diff: (currentMonthData.bigCommerceSales - previousMonthData.bigCommerceSales) / previousMonthData.bigCommerceSales * 100,
                        value: currentMonthData.bigCommerceSales,
                        subtitle:`Previous Month: ${formatter(previousMonthData.bigCommerceSales)}`,
                        format:"currency",
                    },
                    Icon:"coin",
                },
            ]
        },
        {
            title:"Quick Books",
            stats:[
                {
                    stat:{
                        title:"PO Count",
                        diff: (currentMonthData.po_count - previousMonthData.po_count) / previousMonthData.po_count * 100,
                        value: currentMonthData.po_count,
                        subtitle:`Previous Month: ${formatter(previousMonthData.po_count)}`
                    },
                    Icon:"receipt",
                },
                {
                    stat:{
                        title:"PO Total",
                        diff: (currentMonthData.po_total - previousMonthData.po_total) / previousMonthData.po_total * 100,
                        value: currentMonthData.po_total,
                        format:"currency",
                        subtitle:`Previous Month: ${formatter(previousMonthData.po_total,"currency")}`
                    },
                    Icon:"coin",
                },
                {
                    stat:{
                        title:"PO Avg",
                        diff: (currentMonthData.po_avg - previousMonthData.po_avg) / previousMonthData.po_avg * 100,
                        value: currentMonthData.po_avg,
                        format:"currency",
                        subtitle:`Previous Month: ${formatter(previousMonthData.po_avg,"currency")}`
                    },
                    Icon:"coin",
                },
            ]
        },
        {
            title:"Listing Metrics",
            stats:[
                {
                    stat:{
                        title:"Relisting Transactions",
                        diff: (currentMonthData.relisting_transactions - previousMonthData.relisting_transactions) / previousMonthData.relisting_transactions * 100,
                        value: currentMonthData.relisting_transactions,
                        subtitle:`Previous Month: ${formatter(previousMonthData.relisting_transactions)}`
                    },
                    Icon:"receipt",
                },
                {
                    stat:{
                        title:"New Listing Transactions",
                        diff: (currentMonthData.new_listing_transactions - previousMonthData.new_listing_transactions) / previousMonthData.new_listing_transactions * 100,
                        value: currentMonthData.new_listing_transactions,
                        subtitle:`Previous Month: ${formatter(previousMonthData.new_listing_transactions)}`
                    },
                    Icon:"receipt",
                },
                {
                    stat:{
                        title:"Total Increments",
                        diff: (currentMonthData.total_increments - previousMonthData.total_increments) / previousMonthData.total_increments * 100,
                        value: currentMonthData.total_increments,
                        subtitle:`Previous Month: ${formatter(previousMonthData.total_increments)}`
                    },
                    Icon:"receipt",
                },
            ]
        }

    ];
    return (
        <Flex direction={"column"} gap={"md"}>
            {sections.map(({title,stats}) => (
                <Flex gap={"md"} key={title} direction={"column"}>
                    <Text  className={classes.sectionTitle} variant="h2">
                        {title}
                    </Text>
                    <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'sm', cols: 2 }]}>
                        {stats.map((cardDate,i) => <StatCard key={i} {...cardDate} />)}
                    </SimpleGrid>
                </Flex>
            ))}
        </Flex>
    )
}
function SkeletonGrid({month,setMonth}){
    return (
        <>
            <Title style={{textAlign:"center"}} order={1}>Ecommerce Stats</Title>
            <div className={classes.root}>
                <MonthPickerInput
                    label="Pick date"
                    placeholder="Pick date"
                    value={setISODay(addMonths(new Date(month),1),1)}
                    onChange={(e)=>setMonth(formatDateForEcommerce(e))}
                    width={"50%"}
                />
                <div className="spacer" style={{height:"5vh"}}/>
                <Flex direction={"column"} gap={"md"}>
                    <Skeleton height={"1rem"} width={"50%"} radius="md" animate={true} />
                    <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'sm', cols: 2 }]}>
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                    </SimpleGrid>
                    <Skeleton height={"1rem"} width={"50%"} radius="md" animate={true} />
                    <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'sm', cols: 2 }]}>
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                    </SimpleGrid>
                    <Skeleton height={"1rem"} width={"50%"} radius="md" animate={true} />
                    <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'sm', cols: 2 }]}>
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                        <Skeleton height={140} radius="md" animate={false} />
                    </SimpleGrid>
                </Flex>
            </div>
        </>
    )
}







function createData(monthData){
    const {
        impressions,
        big_commerce_sales,
        page_views,
        ebay_sales,
        visits,
        big_commerce_transactions,
        ebay_sales_transactions,
        new_listing_transactions,
        relisting_transactions,
        total_increments,
        shopped,
        add_to_cart,
        web_leads,
        po_avg,
        po_count,
        po_total,
    } = monthData;


    let bigCommerceSales = big_commerce_sales?.reduce((acc,cur) => {
        let {unitPrice,quantity} = cur;
        acc += unitPrice * quantity;
        return acc;
    },0) || "No Data";
    let ebaySales = ebay_sales?.reduce((acc,cur) => {
        let {unitPrice,quantity} = cur;
        acc += unitPrice * quantity;
        return acc;
    },0) || "No Data";
    return {
        impressions,
        bigCommerceSales,
        page_views,
        ebaySales,
        visits,
        big_commerce_transactions,
        ebay_sales_transactions,
        new_listing_transactions,
        relisting_transactions,
        total_increments,
        shopped,
        add_to_cart,
        web_leads,
        po_avg,
        po_count,
        po_total
    }
}

const formatDateForEcommerce = (date) => format(setDate(new Date(date),1),"yyyy-MM-dd")

function mapCommerceData (data,index,array) {
    let {
        big_commerce_sales,
        ebay_sales,
    } = data

    if(big_commerce_sales?.length > 0) {
        big_commerce_sales = big_commerce_sales
            .flat()
            .map((item) => {
                try {
                    return JSON.parse(item)
                } catch (e) {
                    return JSON.parse("[" + item + "]")
                }
            })
            .flat();
    }
    if(ebay_sales?.length > 0) {
        ebay_sales = ebay_sales
            .flat()
            .map((item) => {
                try {
                    return JSON.parse(item)
                } catch (e) {
                    return JSON.parse("[" + item + "]")
                }
            })
            .flat()

    }

    return{...data,...{
            big_commerce_sales,
            ebay_sales,
        }}
}

const Dashboard = () => {
    const [month,setMonth] = React.useState(format(setDate(new Date(),1),"yyyy-MM-dd"));
    let ecommerceData = useUpdates("/api/views/ecommerce");


    if(!ecommerceData || !ecommerceData.rows || ecommerceData.rows.length === 0){
        return <SkeletonGrid setMonth={setMonth} month={month} />
    }


    ecommerceData = ecommerceData.rows.map(mapCommerceData);
    let dates = ecommerceData.map(({month})=>month).reverse();

    let monthData = ecommerceData.find(({month:month_of_transaction})=>month_of_transaction === month);
    const currentMonthData = createData(monthData);

    let previousMonthDate = format(setDate(new Date(month),1),"yyyy-MM-dd");
    let previousMonthData = ecommerceData
        .find(({month:month_of_transaction})=>month_of_transaction === previousMonthDate);
    previousMonthData = previousMonthData ? createData(previousMonthData) : null;


    return (
        <RoleWrapper LoadingComponent={<SkeletonGrid setMonth={setMonth} month={month}/> }>
            <Title style={{textAlign:"center"}} order={1}>Ecommerce Stats</Title>
            <div className={classes.root}>
                <MonthPickerInput
                    label="Pick date"
                    placeholder="Pick date"
                    value={setISODay(addMonths(new Date(month),1),1)}
                    onChange={(e)=>setMonth(formatDateForEcommerce(e))}
                    width={"50%"}
                />
                <div className="spacer" style={{height:"5vh"}}/>
                <MasonryGrid current={currentMonthData} previous={previousMonthData} />
            </div>
        </RoleWrapper>
    );
};

export default Dashboard;