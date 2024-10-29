import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import {Container, Skeleton, Table, Tabs, Text, Title} from "@mantine/core";
import formatter from "../../../modules/utils/numberFormatter";
import useUsage from "../../../modules/hooks/useUsage";
import {startOfYear} from "date-fns";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";


const buckets = [
    {
        min: 0,
        max: 25,
        label: "$25.00 and under"
    },
    {
        min: 25,
        max: 50,
        label: "$25.01 - $50.00"
    },
    {
        min: 50,
        max: 75,
        label: "$50.01 - $75.00"
    },
    {
        min: 75,
        max: 100,
        label: "$75.01 - $100.00"
    },
    {
        min: 100,
        max: 200,
        label: "$100.01 - $200.00"
    },
    {
        min: 200,
        max: 300,
        label: "$200.01 - $300.00"
    },
    {
        min: 300,
        max: 400,
        label: "$300.01 - $400.00"
    },
    {
        min: 400,
        max: 500,
        label: "$400.01 - $500.00"
    },
    {
        min: 500,
        max: 1000,
        label: "$500.01 - $1000.00"
    },
    {
        min: 1000,
        max: 2000,
        label: "$1000.01 - $2000.00"
    },
    {
        min: 2000,
        max: 3000,
        label: "$2000.01 - $3000.00"
    },
    {
        min: 3000,
        max: 4000,
        label: "$3000.01 - $4000.00"
    },
    {
        min: 4000,
        max: 5000,
        label: "$4000.01 - $5000.00"
    },
    {
        min: 5000,
        max: Infinity,
        label: "$5000.01 and above"
    }
];

const macroBuckets = [
    {
        min: 0,
        max: 100,
        label: "$100 and under"
    },
    {
        min: 100,
        max: 500,
        label: "$100.01 - $500.00"
    },
    {
        min: 500,
        max: 3000,
        label: "$500.01 - $3000.00"
    },
    {
        min: 3000,
        max: Infinity,
        label: "$3000.01 and above"
    },
];

const limitLog = (limit) => {
    let counter = 0;
    return (...val) => {
        if (counter === limit) return;
        counter++;

    }
}
let log = limitLog(100);
const SalesBuckets = () => {
    useUsage("Ecommerce", "sales-priceBuckets-table")
    const [[startDate, endDate], setDateRange] = useState([startOfYear(new Date()), new Date()]);
    let sales = useUpdates(`/api/views/sales/usingComponent?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
    const regex = /^\d+(-[1-4])?$/
    let beforeLength = sales.length;
    sales = sales.filter(sale => regex.test(sale['sku']))
    let afterLength = sales.length;


    const isLoading = sales.length === 0;

    const priceRangeBuckets = new Map( buckets.map( range => [range.label, [] ] ));
    const macroBucketsMap = new Map( macroBuckets.map( range => [range.min, [] ] ));

    sales.forEach( sale => {
        let priceRange = buckets.find(range => (sale['retail_price'] > range.min || (range.min === 0 && Number(sale['retail_price']) === 0)) && sale['retail_price'] <= range.max)
        if(priceRange){
            priceRangeBuckets.get(priceRange.label).push(sale)
        } else {
            log("No range found for ", sale)
        }
    });

    buckets.forEach( (range) => {
        let macroBucket = macroBuckets.find( macroRange => range.min >= macroRange.min && range.max <= macroRange.max )
        if(macroBucket){
            macroBucketsMap.get(macroBucket.min).push({label:range.label, sales: priceRangeBuckets.get(range.label)})
        }
    });


    const totalSales = sales.reduce( (acc, sale) => {
        if( sale['quantity'] < 0 ) return acc;
        return acc + Number(Number(sale['sold_price']) * Number(sale['quantity_sold']))
    }, 0);

    const totalQuantitySold = sales.reduce( (acc, sale) => {
        return acc + Number(sale['quantity_sold'])
    }, 0);

    const totalOfItemsAvailableForSell = formatter(
        sales.reduce( (acc, sale) => acc + Number(sale['quantity']), 0)
    );

    const valueOfAllItemsAvailableForSell = formatter(
        sales.reduce( (acc, sale) => {
            if( sale['quantity'] < 0 ) return acc;
            return acc + (Number(sale['quantity'] || 0) * Number(sale['retail_price'] || 0))
        }, 0)
        ,'currency'
    );

    let count = 0;
    macroBucketsMap.forEach((value) => {
        count += value.reduce( (acc, bucket) => acc + bucket.sales.length, 0)
    });

    return (
        <Container fluid>
            <Title order={1} mb={'xl'} >Sales by Price Range</Title>
            <CustomRangeMenu
                label={"Select Date Range"}
                defaultValue={[startDate, endDate]}
                subscribe={setDateRange}
                mb={'lg'}
            />
            {isLoading && <Text> This page can take a while to load ( 20 - 30 seconds ) </Text>}
            <Skeleton visible={isLoading} >
                <Tabs defaultValue={`${macroBuckets[0].min}`}>
                    <Tabs.List mb={'xl'}>
                        {macroBuckets.map( range => (
                                <Tabs.Tab
                                    key={`tab-${range.min}`}
                                    value={`${range.min}`}
                                >
                                    {range.label}
                                </Tabs.Tab>
                            )
                        )}
                    </Tabs.List>
                    {
                        macroBuckets.map( range => {

                            let totalOfSales = macroBucketsMap
                                .get(range.min)
                                .map( bucket => (
                                    formatter(
                                        bucket
                                            .sales
                                            .reduce( (acc, sale) => {
                                                if( sale['quantity'] < 0 ) return acc;
                                                return acc + Number(sale['sold_price'] * Number(sale['quantity_sold']))
                                            }, 0),'currency')
                                ));

                            let totalQuantitySoldBucket = macroBucketsMap
                                .get(range.min)
                                .map( bucket => (formatter(
                                        bucket
                                            .sales
                                            .reduce( (acc, sale) => acc + Number(sale['quantity_sold']), 0),'number')
                                ));

                            let totalOfItemsAvailableForSellInRange = macroBucketsMap
                                .get(range.min)
                                .map( bucket =>  (
                                    formatter(
                                        bucket
                                            .sales
                                            .reduce( (acc, sale) => {
                                                if(!sale['quantity']) return acc;
                                                if( sale['quantity'] < 0 ) return acc;
                                                return acc + Number(sale['quantity'])
                                            }, 0)
                                        ,'number')
                                ));

                            let totalQuantityAvailableToSaleInRange = macroBucketsMap
                                .get(range.min)
                                .map( bucket => (
                                    formatter(
                                        bucket
                                            .sales
                                            .reduce( (acc, sale) => {
                                                if(!sale['quantity'] || !sale['retail_price']) return acc;
                                                if( sale['quantity'] < 0 ) return acc;
                                                return acc + (Number(sale['quantity'] || 0) * Number(sale['retail_price'] || 0))
                                            },0)
                                        ,'currency')
                                ));

                            let percentOfTotalSales = macroBucketsMap
                                .get(range.min)
                                .map( bucket => (
                                    formatter(
                                        bucket
                                            .sales
                                            .reduce( (acc, sale) =>{
                                                if( sale['quantity'] < 0 ) return acc;
                                                return acc + Number(Number(sale['sold_price']) * Number(sale['quantity_sold']))
                                            }, 0)/ totalSales * 100) + "%"
                                ));

                            let percentOfSoldItems = macroBucketsMap
                                .get(range.min)
                                .map( bucket => (
                                    formatter((
                                        bucket
                                            .sales
                                            .reduce( (acc, sale) => acc + Number(sale['quantity_sold']), 0) / totalQuantitySold) * 100)) + "%");

                            let rows = [
                                {
                                    label: "Total Sales",
                                    values: [
                                        ...totalOfSales,
                                        formatter(totalOfSales.map(val => Number(`${val}`.replace(/[^0-9.-]+/g, ""))).reduce((a, b) => a + b, 0), "currency"),
                                        formatter(totalSales,'currency')
                                    ]
                                },
                                {
                                    label: "Total Quantity Sold",
                                    values: [
                                        ...totalQuantitySoldBucket,
                                        formatter(totalQuantitySoldBucket.map( val => Number(`${val}`.replace(/[^0-9.-]+/g,""))).reduce( (a,b) => a + b, 0)),
                                        formatter(totalQuantitySold,'number')
                                    ]
                                },
                                {
                                    label: "Percent of Total Sales",
                                    values: [
                                        ...percentOfTotalSales,
                                            percentOfTotalSales.length > 0 ? percentOfTotalSales.reduce( (a,b) => a + Number(b.replace('%','')), 0) + '%' : 0,
                                            " "
                                    ]
                                },
                                {
                                    label: "Percent of Sold Items",
                                    values: [
                                        ...percentOfSoldItems,
                                            percentOfSoldItems.length > 0 ? percentOfSoldItems.reduce( (a,b) => a + Number(b.replace('%','')), 0) + '%' : 0,
                                        " "
                                    ]
                                },
                                {
                                    label: "Total Items Available for Sell in Range",
                                    values: [
                                        ...totalOfItemsAvailableForSellInRange,
                                        formatter(totalOfItemsAvailableForSellInRange.map( val => Number(`${val}`.replace(/[^0-9.-]+/g,""))).reduce( (a,b) => a + b, 0)),
                                        totalOfItemsAvailableForSell
                                    ]
                                },
                                {
                                    label: "Total Inventory Value in Range",
                                    values: [
                                        ...totalQuantityAvailableToSaleInRange,
                                        formatter(totalQuantityAvailableToSaleInRange.map( val => Number(`${val}`.replace(/[^0-9.-]+/g,""))).reduce( (a,b) => a + b, 0),'currency'),
                                        valueOfAllItemsAvailableForSell
                                    ]
                                }
                            ]

                            return (
                                <Tabs.Panel key={`panel-${range.min}`} value={`${range.min}`}>
                                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Selling Price Range</Table.Th>
                                                {
                                                    macroBucketsMap
                                                        .get(range.min)
                                                        .map( bucket => (
                                                            <Table.Th key={`th-${bucket.label}`}>{bucket.label}</Table.Th>
                                                        ))
                                                }
                                                <Table.Th> Total for Group </Table.Th>
                                                <Table.Th> Total For All Ranges </Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {
                                                rows.map(row => (
                                                    <Table.Tr key={`tr-${row.label}`}>
                                                        {row.values && [row.label, ...row.values].map( (val, index) => (
                                                            <Table.Td key={index}>{val}</Table.Td>
                                                        ))}
                                                    </Table.Tr>
                                                ))
                                            }
                                        </Table.Tbody>
                                    </Table>
                                </Tabs.Panel>
                            )})
                    }
                </Tabs>
            </Skeleton>
        </Container>
    );
};

export default SalesBuckets;