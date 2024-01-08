import React from 'react';
import {Flex, SimpleGrid, Text, Title, Skeleton, Group, Box} from '@mantine/core';
import classes from '../../styles/StatsGrid.module.css';
import {addMonths, format, setDate, setISODay, subMonths, subYears} from "date-fns";
import useUpdates from "../../modules/hooks/useUpdates";
import formatter from "../../modules/utils/numberFormatter";
import {MonthPickerInput} from '@mantine/dates';
import StatCard from "../../components/mantine/StatCard";
import useUsage from "../../modules/hooks/useUsage";
import {
    IconArrowLoopRight2,
    IconArrowUp,
    IconBasket,
    IconBasketDollar,
    IconBasketFilled,
    IconEye,
    IconPointerCheck,
    IconReceipt,
    IconShoppingCartFilled,
    IconStackMiddle,
    IconTallymarks,
    IconUserCode
} from "@tabler/icons-react";
import mapEcommerceData from "../../modules/utils/conversionUtils/mapEccommerceData";


function MasonryGrid({current, previous, previousYear}) {
    const currentMonthData = current;
    let previousMonthData = previous ? previous : {
        impressions: "No Data",
        page_views: "No Data",
        visits: "No Data",
        ebay_sales: "No Data",
    };
    let previousYearData = previousYear ? previousYear : {
        impressions: "No Data",
        page_views: "No Data",
        visits: "No Data",
        ebay_sales: "No Data",
    }

    const sections = [
        {
            title: "Ebay",
            stats: [
                {
                    stat: {
                        title: "Impressions",
                        yoyDiff: (currentMonthData.impressions - previousYearData.impressions) / previousYearData.impressions * 100,
                        diff: (currentMonthData.impressions - previousMonthData.impressions) / previousMonthData.impressions * 100,
                        value: currentMonthData.impressions,
                        subtitle: `Previous Month: ${formatter(previousMonthData.impressions)} | Previous Year: ${formatter(previousYearData.impressions)}`
                    },
                    Icon: IconEye
                },
                {
                    stat: {
                        title: "Page Views",
                        yoyDiff: (currentMonthData.page_views - previousYearData.page_views) / previousYearData.page_views * 100,
                        diff: (currentMonthData.page_views - previousMonthData.page_views) / previousMonthData.page_views * 100,
                        value: currentMonthData.page_views,
                        subtitle: `Conversion Rate: ${Math.trunc(currentMonthData.page_views / currentMonthData.impressions * 10000) / 100}%`
                    },
                    Icon:IconPointerCheck
                },
                {
                    stat: {
                        title: "Ebay Sales Transactions",
                        yoyDiff: previousYearData.ebay_sales_transactions < 10 ? null : (currentMonthData.ebay_sales_transactions - previousYearData.ebay_sales_transactions) / previousYearData.ebay_sales_transactions * 100,
                        diff: (currentMonthData.ebay_sales_transactions - previousMonthData.ebay_sales_transactions) / previousMonthData.ebay_sales_transactions * 100,
                        value: currentMonthData.ebay_sales_transactions,
                        subtitle: `Order Rate: ${Math.trunc(currentMonthData.ebay_sales_transactions / currentMonthData.page_views * 10000) / 100}%`
                    },
                    Icon: IconReceipt
                },
                {
                    stat: {
                        title: "Ebay Sales",
                        yoyDiff:previousYearData.ebaySales < 100 ? null : (currentMonthData.ebaySales - previousYearData.ebaySales) / previousYearData.ebaySales * 100,
                        diff: (currentMonthData.ebaySales - previousMonthData.ebaySales) / previousMonthData.ebaySales * 100,
                        value: currentMonthData.ebaySales,
                        format: "currency",
                        subtitle: `Previous Month: ${formatter(previousMonthData.ebaySales, "currency")}`
                    },
                    Icon:IconBasketFilled
                },
            ]
        },
        {
            title: "Big Commerce",
            stats: [
                {
                    stat: {
                        title: "Visits",
                        yoyDiff: (currentMonthData.visits - previousYearData.visits) / previousYearData.visits * 100,
                        diff: (currentMonthData.visits - previousMonthData.visits) / previousMonthData.visits * 100,
                        value: currentMonthData.visits,
                        subtitle: `Previous Month: ${formatter(previousMonthData.visits)} | Previous Year: ${formatter(previousYearData.visits)}`
                    },
                    Icon: IconEye
                },
                {
                    stat: {
                        title: "Shopped",
                        yoyDiff: (currentMonthData.shopped - previousYearData.shopped) / previousYearData.shopped * 100,
                        diff: (currentMonthData.shopped - previousMonthData.shopped) / previousMonthData.shopped * 100,
                        value: currentMonthData.shopped,
                        subtitle: `Conversion Rate: ${Math.trunc(currentMonthData.shopped / currentMonthData.visits * 10000) / 100}%`
                    },
                    Icon: IconBasket
                },
                {
                    stat: {
                        title: "Add To Cart",
                        yoyDiff: (currentMonthData.add_to_cart - previousYearData.add_to_cart) / previousYearData.add_to_cart * 100,
                        diff: (currentMonthData.add_to_cart - previousMonthData.add_to_cart) / previousMonthData.add_to_cart * 100,
                        value: currentMonthData.add_to_cart,
                        subtitle: `Order Rate: ${Math.trunc(currentMonthData.add_to_cart / currentMonthData.visits * 10000) / 100}%`
                    },
                    Icon: IconShoppingCartFilled
                },
                {
                    stat: {
                        title: "Transactions",
                        yoyDiff: (currentMonthData.big_commerce_transactions - previousYearData.big_commerce_transactions) / previousYearData.big_commerce_transactions * 100,
                        diff: (currentMonthData.big_commerce_transactions - previousMonthData.big_commerce_transactions) / previousMonthData.big_commerce_transactions * 100,
                        value: currentMonthData.big_commerce_transactions,
                        subtitle: `Close Rate: ${Math.trunc(currentMonthData.big_commerce_transactions / currentMonthData.add_to_cart * 10000) / 100}%`
                    },
                    Icon: IconReceipt
                },
                {
                    stat: {
                        title: "Web Leads",
                        yoyDiff: previousYearData.web_leads < 10 ? null: (currentMonthData.web_leads - previousYearData.web_leads) / previousYearData.web_leads * 100,
                        diff: (currentMonthData.web_leads - previousMonthData.web_leads) / previousMonthData.web_leads * 100,
                        value: currentMonthData.web_leads,
                        subtitle: `Previous Month: ${formatter(previousMonthData.web_leads)} | Previous Year: ${formatter(previousYearData.web_leads)}`
                    },
                    Icon: IconUserCode
                },
                {
                    stat: {
                        title: "Sales",
                        yoyDiff: (currentMonthData.bigCommerceSales - previousYearData.bigCommerceSales) / previousYearData.bigCommerceSales * 100,
                        diff: (currentMonthData.bigCommerceSales - previousMonthData.bigCommerceSales) / previousMonthData.bigCommerceSales * 100,
                        value: currentMonthData.bigCommerceSales,
                        subtitle: `Previous Month: ${formatter(previousMonthData.bigCommerceSales)} | Previous Year: ${formatter(previousYearData.bigCommerceSales)}`,
                        format: "currency",
                    },
                    Icon: IconBasketDollar
                },
            ]
        },
        {
            title: "Quick Books",
            stats: [
                {
                    stat: {
                        title: "PO Count",
                        yoyDiff: (currentMonthData.po_count - previousYearData.po_count) / previousYearData.po_count * 100,
                        diff: (currentMonthData.po_count - previousMonthData.po_count) / previousMonthData.po_count * 100,
                        value: currentMonthData.po_count,
                        subtitle: `Previous Month: ${formatter(previousMonthData.po_count)} | Previous Year: ${formatter(previousYearData.po_count)}`
                    },
                    Icon: IconTallymarks
                },
                {
                    stat: {
                        title: "PO Total",
                        yoyDiff: (currentMonthData.po_total - previousYearData.po_total) / previousYearData.po_total * 100,
                        diff: (currentMonthData.po_total - previousMonthData.po_total) / previousMonthData.po_total * 100,
                        value: currentMonthData.po_total,
                        format: "currency",
                        subtitle: `Previous Month: ${formatter(previousMonthData.po_total, "currency")} | Previous Year: ${formatter(previousYearData.po_total, "currency")}`
                    },
                    Icon: IconReceipt
                },
                {
                    stat: {
                        title: "PO Avg",
                        yoyDiff: (currentMonthData.po_avg - previousYearData.po_avg) / previousYearData.po_avg * 100,
                        diff: (currentMonthData.po_avg - previousMonthData.po_avg) / previousMonthData.po_avg * 100,
                        value: currentMonthData.po_avg,
                        format: "currency",
                        subtitle: `Previous Month: ${formatter(previousMonthData.po_avg, "currency")} | Previous Year: ${formatter(previousYearData.po_avg, "currency")}`
                    },
                    Icon:IconStackMiddle
                },
            ]
        },
        {
            title: "Listing Metrics",
            stats: [
                {
                    stat: {
                        title: "Relisting Transactions",
                        yoyDiff:previousYearData.relisting_transactions <= 0 ? null : (currentMonthData.relisting_transactions - previousYearData.relisting_transactions) / previousYearData.relisting_transactions * 100,
                        diff: (currentMonthData.relisting_transactions - previousMonthData.relisting_transactions) / previousMonthData.relisting_transactions * 100,
                        value: currentMonthData.relisting_transactions,
                        subtitle: `Previous Month: ${formatter(previousMonthData.relisting_transactions)}`
                    },
                    Icon:IconArrowLoopRight2
                },
                {
                    stat: {
                        title: "New Listing Transactions",
                        yoyDiff:  previousYearData.new_listing_transactions <= 0 ? null : (currentMonthData.new_listing_transactions - previousYearData.new_listing_transactions) / previousYearData.new_listing_transactions * 100,
                        diff: (currentMonthData.new_listing_transactions - previousMonthData.new_listing_transactions) / previousMonthData.new_listing_transactions * 100,
                        value: currentMonthData.new_listing_transactions,
                        subtitle: `Previous Month: ${formatter(previousMonthData.new_listing_transactions)}`
                    },
                    Icon: IconArrowUp
                },
                {
                    stat: {
                        title: "Total Increments",
                        yoyDiff: (currentMonthData.total_increments - previousYearData.total_increments) / previousYearData.total_increments * 100,
                        diff: (currentMonthData.total_increments - previousMonthData.total_increments) / previousMonthData.total_increments * 100,
                        value: currentMonthData.total_increments,
                        subtitle: `Previous Month: ${formatter(previousMonthData.total_increments)}`
                    },
                    Icon: IconTallymarks
                },
            ]
        }

    ];
    return (
        <Flex direction={"column"} gap={"md"}>
            <Box fz={'sm'} c={'dim'} className={classes['sectionSubtitle']} variant="h5">
                If looking at the current month, please keep in mind the numbers are compared against a full month.
                <br/>
                <br/>
                Legend:
                <Group mb={'sm'} mt={'sm'}>
                    <Text className={classes.value}>Current Month</Text>
                    <Text c={'teal'} fz="sm" fw={500}> Previous month </Text>
                    <Text c={'red'} fz="sm" fw={500}> Previous year </Text>
                </Group>
            </Box>
            {sections.map(({title, stats}) => (
                <Flex gap={"md"} key={title} direction={"column"}>
                    <Text className={classes['sectionTitle']} variant="h2">
                        {title}
                    </Text>
                    <SimpleGrid cols={4} breakpoints={[{maxWidth: 'sm', cols: 2}]}>
                        {stats.map((cardDate, i) => <StatCard key={i} {...cardDate} />)}
                    </SimpleGrid>
                </Flex>
            ))}
        </Flex>
    )
}

function SkeletonGrid({month, setMonth}) {
    return (
        <>
            <Title style={{textAlign: "center"}} order={1}>Ecommerce Stats</Title>
            <div className={classes.root}>
                <MonthPickerInput
                    label="Pick date"
                    placeholder="Pick date"
                    value={setISODay(addMonths(new Date(month), 1), 1)}
                    onChange={(e) => setMonth(formatDateForEcommerce(e))}
                    width={"50%"}
                />
                <div className="spacer" style={{height: "5vh"}}/>
                <Flex direction={"column"} gap={"md"}>
                    <Skeleton height={"1rem"} width={"50%"} radius="md" animate={true}/>
                    <SimpleGrid cols={4} breakpoints={[{maxWidth: 'sm', cols: 2}]}>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                    </SimpleGrid>
                    <Skeleton height={"1rem"} width={"50%"} radius="md" animate={true}/>
                    <SimpleGrid cols={4} breakpoints={[{maxWidth: 'sm', cols: 2}]}>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                    </SimpleGrid>
                    <Skeleton height={"1rem"} width={"50%"} radius="md" animate={true}/>
                    <SimpleGrid cols={4} breakpoints={[{maxWidth: 'sm', cols: 2}]}>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                        <Skeleton height={140} radius="md" animate={false}/>
                    </SimpleGrid>
                </Flex>
            </div>
        </>
    )
}


function createData(monthData) {
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


    let bigCommerceSales = big_commerce_sales?.reduce((acc, cur) => {
        let {unitPrice, quantity} = cur;
        acc += unitPrice * quantity;
        return acc;
    }, 0) || "No Data";
    let ebaySales = ebay_sales?.reduce((acc, cur) => {
        let {unitPrice, quantity} = cur;
        acc += unitPrice * quantity;
        return acc;
    }, 0) || "No Data";
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

const formatDateForEcommerce = (date) => format(setDate(new Date(date), 1), "yyyy-MM-dd")



const Dashboard = () => {
    useUsage("Ecommerce","Dashboard")
    const [month, setMonth] = React.useState(setDate(new Date, 1));
    let ecommerceData = useUpdates("/api/views/ecommerce");

    if (!ecommerceData || !ecommerceData.rows || ecommerceData.rows.length === 0) {
        return <SkeletonGrid setMonth={setMonth} month={month}/>
    }


    ecommerceData = mapEcommerceData(ecommerceData.rows)

    let monthData = ecommerceData.find(({month: month_of_transaction}) => month_of_transaction === month.toISOString().split("T")[0]);
    const currentMonthData = createData(monthData);

    let previousMonthDate = subMonths(new Date(month), 1).toISOString().split("T")[0];
    let previousMonthData = ecommerceData
        .find(({month: month_of_transaction}) => month_of_transaction === previousMonthDate);
    previousMonthData = previousMonthData ? createData(previousMonthData) : null;

    let previousYearDate = subYears(new Date(month), 1).toISOString().split("T")[0];
    let previousYearData = ecommerceData
        .find(({month: month_of_transaction}) => month_of_transaction === previousYearDate);
    previousYearData = previousYearData ? createData(previousYearData) : null;

    return (
        <>
            <Title style={{textAlign: "center"}} order={1}>Ecommerce Stats</Title>
            <div className={classes.root}>
                <MonthPickerInput
                    label="Pick date"
                    placeholder="Pick date"
                    value={month}
                    onChange={setMonth}
                    width={"50%"}
                />
                <div className="spacer" style={{height: "5vh"}}/>
                <MasonryGrid current={currentMonthData} previous={previousMonthData} previousYear={previousYearData}/>
            </div>
        </>
    );
};

export default Dashboard;