import React, { useCallback, useMemo } from 'react';
import DataGrid from "../components/agGrid";
import { Container, NumberFormatter } from "@mantine/core";
import useOrders from "../modules/hooks/useOrders";
import { lastDayOfMonth } from "date-fns";
import { storeNames } from "../modules/constants";


export function MoneyRenderer({ value, newValue }) {
    if( value === null && newValue ) return "Not Provided"
    if( newValue ) return <NumberFormatter
        decimalScale={2}
        thousandSeparator
        value={newValue}
        prefix={'$'}
    />
    return <NumberFormatter
        decimalScale={2}
        thousandSeparator
        value={value}
        prefix={'$'}
    />
}


function OrdersRenderer({ orders, onRowClicked }) {
    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
    }), []);
    const columnDefs = useMemo(() => [
        {
            headerName: "Customer",
            field: "name",
            enableRowGroup: true,
            flex: 1,
        },
        {
            headerName: "Order Details",
            openByDefault: false,
            children: [
                {
                    headerName: "Order ID",
                    field: "orderId",
                    columnGroupShow: 'open',
                },
                {
                    headerName: "Store",
                    field: "storeId",
                    enableRowGroup: true,
                    valueGetter: (params) => {
                        let storeId = params?.data?.storeId;
                        return storeId ? storeNames[String(storeId)] : null;
                    }
                },
                {
                    headerName: "Payment Date",
                    field: "paymentDate",
                    cellRenderer: 'DateRenderer',
                    valueGetter: (params) => params?.data?.paymentDate ? new Date(params.data?.paymentDate) : null,
                    enableRowGroup: true,
                },
                {
                    headerName: "Order Status",
                    field: "orderStatus",
                },
                {
                    headerName: "Items",
                    openByDefault: false,
                    children: [
                        {
                            headerName: "Items Count",
                            valueGetter: (params) => {
                                return params?.data?.items?.length ?? 0;
                            }
                        },
                        {
                            headerName: "Order Total",
                            cellRenderer: MoneyRenderer,
                            valueGetter: (params) => {
                                return params?.data?.total;
                            }
                        },
                        {
                            headerName: "Average Price",
                            cellRenderer: MoneyRenderer,
                            columnGroupShow: 'open',
                            valueGetter: (params) => {
                                let total = params?.data?.items?.reduce((acc, curr) => acc + curr?.unitPrice * curr?.quantity, 0);
                                let count = params?.data?.items?.length;
                                return total / count;
                            }
                        }
                    ]
                }

            ]
        },


    ], []);
    const detailCellRendererParams = useMemo(() => ({
        detailGridOptions: {
            defaultColDef: {
                flex: 1,
                sortable: true,
                filter: true,
            },
            columnDefs: [
                {
                    headerName: "Title",
                    field: "name",
                },
                {
                    headerName: "SKU",
                    field: "sku",
                },
                {
                    headerName: "Quantity",
                    field: "quantity",
                },
                {
                    headerName: "Price",
                    field: "unitPrice",
                }
            ]
        },
        getDetailRowData: params => {
            console.log(params.data.items);
            params.successCallback(params.data.items);
        }
    }), []);
    const getID = useCallback((params) => {
        return params.data.orderId
    }, []);

    return (
        <DataGrid
            sidebar={true}
            masterDetail={true}
            rowGroupPanelShow={'always'}
            sideBar={true}
            pagination
            enableCharts
            autoUpdateMasterDetail
            rowData={orders}
            getRowId={getID}
            columnDefs={columnDefs}
            onRowClicked={onRowClicked}
            defaultColDef={defaultColDef}
            detailCellRendererParams={detailCellRendererParams}
        />
    )
}


const Test = () => {
    let date = new Date('10-01-2024');
    let startDate = date;
    let endDate = lastDayOfMonth(date);

    const orders = useOrders(
        {
            startDate,
            endDate
        },
        {
            acceptedConditions: ["1", "2", "3", "4"]
        });

    const onRowClicked = useCallback((params) => {
        const node = params.node;
        node.setExpanded( !node.expanded);
    }, []);

//todo for incentive app innerRendererSelector !!!!!
    return (
        <Container size={'responsive'} h={'83.5vh'}>
            <OrdersRenderer
                orders={orders}
                onRowClicked={onRowClicked}
            />
        </Container>
    );
};

export default Test;