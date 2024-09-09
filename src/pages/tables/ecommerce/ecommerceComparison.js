import React, {useState} from 'react';
import {MonthPickerInput} from "@mantine/dates";

import {Text} from "@mantine/core";
import {toHeaderCase} from "js-convert-case";

import {IconArrowDownRight, IconArrowUpRight} from "@tabler/icons-react";
import {endOfMonth, setDate, subMonths} from "date-fns";
import mapEcommerceData from "../../../modules/utils/conversionUtils/mapEccommerceData";
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {TableSort} from "../../../components/mantine/TableSort";
import formatter from "../../../modules/utils/numberFormatter";
import useOrders from "../../../modules/hooks/useOrders";

function parseSalesData(data) {
    const ebayStoreId = 255895;
    const bigCommerceStoreId = 225004;

    let results = {
        bigCommerce: {
            salesTotal: 0,
            transactions: 0,
        },
        ebay: {
            salesTotal: 0,
            transactions: 0,
        }
    };

    data.forEach((order) => {
        let orderStoreId = Number(order.storeId);
        if (orderStoreId === ebayStoreId) {
            results.ebay.salesTotal += order.total;
            results.ebay.transactions += 1;
        } else if (orderStoreId === bigCommerceStoreId) {
            results.bigCommerce.salesTotal += order.total;
            results.bigCommerce.transactions += 1;
        } else {
            console.log(order.storeId);
        }
    });

    return results;
}

const DateComparisonEcommerce = () => {

    const [baseDate, setBaseDate] = useState(subMonths(setDate(new Date(), 1),2));
    const [compareDate, setCompareDate] = useState(subMonths(setDate(new Date(), 1),1));

    let eCommerceData = useUpdates('/api/views/ecommerce');
    const baseSalesData = useOrders({
        startDate: baseDate,
        endDate: endOfMonth(baseDate),
    });

    const compareSalesData = useOrders({
        startDate: compareDate,
        endDate: endOfMonth(compareDate),
    });

    const baseMonthSales = parseSalesData(baseSalesData);
    const compareMonthSales = parseSalesData(compareSalesData);

    if (!eCommerceData || !eCommerceData.rows || eCommerceData.rows.length === 0 || !baseSalesData || !compareSalesData) return null
    eCommerceData = mapEcommerceData(eCommerceData.rows);

    function chooseMonth(date) {
        let dateString = date.toISOString().split('T')[0];
        return eCommerceData.find((item) => item.month === dateString);
    }

    let baseMonth = chooseMonth(baseDate);
    let compareMonth = chooseMonth(compareDate);

    baseMonth.big_commerce_sales = baseMonthSales.bigCommerce.salesTotal;
    baseMonth.ebay_sales = baseMonthSales.ebay.salesTotal;
    baseMonth.big_commerce_transactions = baseMonthSales.bigCommerce.transactions;
    baseMonth.ebay_transactions = baseMonthSales.ebay.transactions;

    compareMonth.big_commerce_sales = compareMonthSales.bigCommerce.salesTotal;
    compareMonth.ebay_sales = compareMonthSales.ebay.salesTotal;
    compareMonth.big_commerce_transactions = compareMonthSales.bigCommerce.transactions;
    compareMonth.ebay_transactions = compareMonthSales.ebay.transactions;
    return (
        <GraphWithStatCard
            isLoading={!eCommerceData}
            title={"Ecommerce Comparison"}
            dateInput={
                <MonthPickerInput
                    placeholder="Pick month"
                    label="Base Date"
                    value={baseDate}
                    onChange={setBaseDate}
                    mb={'xl'}
                />
            }
            slotOne={
                <MonthPickerInput
                    placeholder="Pick month"
                    label="Comparison Date"
                    value={compareDate}
                    onChange={setCompareDate}
                    mb={'xl'}
                />
            }
        >

            <TableSort
                noSearch
                specialFormatting={[
                    {column: 'base', fn: (value) => <Text span>{formatter(value)}</Text>},
                    {column: 'compare', fn: (value) => <Text span>{formatter(value)}</Text>},
                    {column: 'change',
                        fn: (value) => <Text span c={value > 0 ? 'teal' : 'red'}>
                            {formatter(value)} {
                            value === 0 ? null :
                                value > 0 ?
                            <IconArrowUpRight size="1rem" stroke={1.5}/> :
                            <IconArrowDownRight size="1rem" stroke={1.5}/>}
                        </Text>
                    },
                    {column: 'percent',
                        fn: (value) => <Text span c={value > 0 ? 'teal' : 'red'}>
                            {isNaN(value) ? 0 : value}%
                            {(isNaN(value) || value === 0) ? null : value > 0 ?
                                <IconArrowUpRight size="1rem" stroke={1.5}/> :
                                <IconArrowDownRight size="1rem" stroke={1.5}/>}
                        </Text>},
                    {column: 'stat', fn: (value) => <Text span fw={700}>{toHeaderCase(value)}</Text>}
                ]}
                data={
                    Object.entries(baseMonth)
                        .filter(([key, value]) => {
                            return key !== 'month'
                        })
                        .map(([key, value]) => {
                            if (key.includes("sales") && !key.includes("transactions") && Array.isArray(value)) {
                                let reducer = (acc, cur) => {
                                    let quantity = Number(cur.quantity);
                                    let price = isNaN(Number(cur.unitPrice)) ?
                                        cur.unitPrice.replace('$', '').replace(',', '') :
                                        Number(cur.unitPrice);
                                    return acc + (quantity * price);
                                };
                                value = value.reduce(reducer, 0);
                                compareMonth[key] = compareMonth[key].reduce(reducer, 0);
                            }
                            return {
                                stat: key,
                                base: value,
                                compare: compareMonth[key],
                                change: compareMonth[key] - value,
                                percent: `${Math.round(((compareMonth[key] - value) / value) * 100)}`
                            }
                        })
                }
            />

        </GraphWithStatCard>
    );
};

export default DateComparisonEcommerce;