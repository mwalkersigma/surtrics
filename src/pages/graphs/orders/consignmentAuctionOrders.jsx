import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {Box, Container, Flex, NumberFormatter, Title} from "@mantine/core";
import DataGrid from "../../../components/agGrid/index.js";

const ConsignmentAuctionOrders = () => {

    const {data: consignmentAuctionOrders, isPending, error} = useQuery({
        queryKey: ['consignmentAuctionOrders'],
        queryFn: async () => {
            const response = await fetch('/api/views/consignmentAuction');
            return response.json();
        },
    })

    console.log(consignmentAuctionOrders)
    return (
        <Container h={'80vh'} size={'responsive'}>
            <Flex direction={'column'} h={'100%'}>
                <Title mb={'xl'}>Consignment Auction : Sku Sales </Title>
                <Box flex={1}>
                    <DataGrid
                        grandTotalRow={'bottom'}
                        rowData={consignmentAuctionOrders}
                        rowGroupPanelShow={'always'}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            enableRowGroup: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        columnDefs={[
                            {
                                headerName: "Item Information",
                                children: [
                                    {headerName: 'Sku', field: 'sku'},
                                    {headerName: 'Brand', field: 'manufacturer'},
                                    {headerName: 'Model', field: 'title'},
                                    {headerName: "Quantity On Hand", field: "quantity", columnGroupShow: 'open'},
                                ]
                            },
                            {
                                headerName: "Order Information",
                                children: [
                                    {headerName: "Order ID", field: "order_id"},
                                    {
                                        headerName: "Date Sold",
                                        field: "payment_date_utc",
                                        cellRenderer: 'DateRenderer',
                                        filter: 'agDateColumnFilter',
                                        valueGetter: ({data}) => data?.payment_date_utc && new Date(data.payment_date_utc),
                                        cellRendererParams: {notCentered: true}
                                    },
                                    {headerName: "Quantity Sold", field: "quantity_sold", aggFunc: 'sum'},
                                    {headerName: "Customer", field: "name", columnGroupShow: 'open'},
                                ]
                            },
                            {
                                headerName: "Revenue Information",
                                children: [
                                    {
                                        headerName: "Cost",
                                        columnGroupShow: 'open',
                                        field: "cost",
                                        cellRenderer: (params) => params?.value &&
                                            <NumberFormatter value={params.value} prefix={"$"} thousandSeparator={','}
                                                             decimalScale={2} fixedDecimalScale/>
                                    },
                                    {
                                        headerName: "Sold Price",
                                        field: "sold_price",
                                        cellRenderer: (params) => params?.value &&
                                            <NumberFormatter value={params.value} prefix={"$"} thousandSeparator={','}
                                                             decimalScale={2} fixedDecimalScale/>
                                    },
                                    {
                                        headerName: "Gross Revenue",
                                        valueGetter: (params) => params.data?.['quantity_sold'] * params.data?.['sold_price'],
                                        aggFunc: 'sum',
                                        cellRenderer: (params) => params?.value &&
                                            <NumberFormatter value={params.value} prefix={"$"} thousandSeparator={','}
                                                             decimalScale={2} fixedDecimalScale/>
                                    }
                                ]
                            }


                        ]}
                        isLoading={!isPending}
                        error={error}
                    />
                </Box>
            </Flex>

        </Container>
    );
};

export default ConsignmentAuctionOrders;