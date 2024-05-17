import React, {useState} from 'react';
import {Button, Flex, InputLabel, NumberInput} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {TableSort} from "../../../components/tableSort/tableSort";
import formatter from "../../../modules/utils/numberFormatter";
import {IconCurrencyDollar} from "@tabler/icons-react";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {setDate, setMonth} from "date-fns";
import {useQuery} from "@tanstack/react-query";


const FastSellsGraph = () => {

    const [[startDate, endDate], setDateRange] = useState([
        setDate(setMonth(new Date(), 0), 0),
        new Date()
    ]);

    const {data, isLoading} = useQuery({
        queryKey: ["fastSales", startDate, endDate],
        queryFn: async () => {
            let url = `/api/views/fastSales`;
            if (startDate) {
                url += `?startDate=${startDate.toLocaleDateString()}&endDate=${endDate.toLocaleDateString()}`;
            }
            const res = await fetch(url);
            return await res.json();
        }
    });


    const skus = new Map();
    let difference = 0;

    function downloadCSV() {
        let csv = "SKU, PAYMENT DATE, DATE PRICED, TRANSACTION DATE, QUANTITY SOLD,RETAIL PRICE, SOLD PRICE\n";
        skus.forEach((row, sku) => {
            csv += `${sku}, ${row['payment_date_utc']}, ${row['date_priced_utc']}, ${row['transaction_date']}, ${row['quantity_sold']}, ${row["retail_price"]} ${row['sold_price']}\n`
        });

        let hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'fastSales.csv';
        hiddenElement.click();


    }

    if (data) {
        for (let i = 0; i < data.length; i++) {

            const row = data[i];
            let paymentDate = new Date(row['payment_date_utc']);
            let sku = row['sku'];
            let datePriced = new Date(row['date_priced_utc']);
            let transactionDate = new Date(row['transaction_date']);
            const lastInteraction = new Date(Math.max(datePriced, transactionDate));

            let actualOffset = Math.floor((paymentDate - lastInteraction) / (1000 * 60 * 60 * 24));

            if (actualOffset > 0 && actualOffset <= 3) {
                skus.set(sku, row)
            }

        }
        difference = Array.from(skus.values()).reduce((acc, row) => {
            return acc + Number(row['retail_price']) - Number(row['sold_price']);
        }, 0);
    }


    return (
        <GraphWithStatCard
            isLoading={isLoading}
            title={"Fast Sales"}
            dateInput={
                <CustomRangeMenu
                    label={"Select Range"}
                    subscribe={setDateRange}
                    defaultValue={[startDate, endDate]}
                    mb={'xl'}
                />
            }
            slotOne={
                <Flex direction={'column'}>
                    <InputLabel mb={"2px"}> Difference between retail and sold price ( all rows ) </InputLabel>
                    <NumberInput
                        leftSection={<IconCurrencyDollar/>}
                        value={difference}
                        decimalScale={2}
                        disabled
                        readOnly
                    />
                </Flex>
            }
            slotTwo={
                <Flex direction={'column'} justify={'flex-start'}>
                    <InputLabel mb={"2px"}>Download</InputLabel>
                    <Button mt={0} onClick={downloadCSV}>Download CSV</Button>
                </Flex>
            }
        >
            <TableSort
                noSearch
                noDisplay={["id"]}
                withPagination
                specialFormatting={[
                    {
                        column: "sku",
                        fn: (v) => v
                    },
                    {
                        column: "retailPrice",
                        fn: (v) => formatter(v, "currency")
                    },
                    {
                        column: "soldPrice",
                        fn: (v) => formatter(v, "currency")
                    },
                ]}
                data={
                    Array.from(skus.values())
                        .map(row => ({
                            id: row['orderId'],
                            sku: row['sku'],
                            dateSold: row['payment_date_utc'],
                            datePriced: row['date_priced_utc'],
                            dateIncremented: row['transaction_date'],
                            quantitySold: row['quantity_sold'],
                            retailPrice: row['retail_price'],
                            soldPrice: row['sold_price']
                        }))
                }
            />

        </GraphWithStatCard>
    );
};

export default FastSellsGraph;