import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import DataGrid, { BooleanRenderer } from "../../../components/agGrid/index.js";
import { Box, Center, Flex, Group, Loader, LoadingOverlay, NumberFormatter, Tabs, Text } from "@mantine/core";
import useOrders from "../../../modules/hooks/useOrders.js";
import { lastDayOfYear } from "date-fns";
import { storeNames } from "../../../modules/constants.js";
import { IconCircleCheck } from "@tabler/icons-react";
//todo for incentive app innerRendererSelector !!!!!
// add parser version to DB table for PO_sheets
const PurchaseOrderPoNumber = (po) => {
    let candidate = po.po_number.split("PO ")[1];
    return candidate || po.po_number.split("PA ")[1] || po.po_number.split("Purchase Offer ")[1] || po.po_number;
}
const isValidCost = (cost) => cost !== undefined && cost !== null && Number(cost) > 0.1;
const lookupValue = (mappings, key, field) => {
    return mappings?.[key]?.[field];
};
const lookupKey = (mappings, name) => {
    const keys = Object.keys(mappings);
    for ( let i = 0; i < keys.length; i++ ) {
        const key = keys[i];
        if( mappings[key] === name ) {
            return key;
        }
    }
};

function LoadingRenderer({ name, loading }) {
    let status = loading ? <Loader size={20} color="blue" type="dots"/> :
        <IconCircleCheck p={0} color={'var(--mantine-color-green-5)'}/>;
    return (<Group mb={'sm'} justify={'space-between'}>
        <Center>
            <Text>{name}</Text>
        </Center>

        <Center>
            {status}
        </Center>
    </Group>)
}

function ComponentLoader({ loadingStates }) {
    if( !loadingStates ) return null;
    return (
        <Flex direction={'column'}>
            {
                loadingStates.map((state, i) => {
                    return (<LoadingRenderer key={i} loading={state.isPending} name={state.name}/>)
                })
            }
        </Flex>
    )
}

function joinFactory(mapping) {
    return (field) => ({
        valueGetter: (params) => {
            let sku = params?.data?.['SKU'] ?? params?.data?.['sku'] ?? params?.data?.['Sku'];
            return lookupValue(mapping, sku, field) //params?.data?.['SKU']
        },
        valueParser: params => {
            return lookupKey(mapping, params.newValue, field);
        }
    })
}

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

let ignoredSkus = [999999, '999999'];
let poPoNumbers = [
    13027,
    111680,
    112597,
    113441,
    114855,
    12998,
    40824845,
    112493,
    13050,
    10608,
    13055,
    13202,
    10856,
    12849,
    12971,
    13015,
    12625,
    13096,
    115995,
    12841,
    13047,
    114631,
    12639,
    126991,
    12846,
    12954,
    13080,
    13171,
    40770046,
    111778,
    111780,
    112433,
    113433,
    115676,

];

function PoRenderer({ filteredData, skuData, getJoinedData, onRowClicked }) {
    const columnDefs = useMemo(() => [
        {
            headerName: "ID",
            field: "id",
        },
        {
            headerName: "PO ID",
            field: "po_id",
        },
        {
            headerName: "PO Number",
            field: "po_number",
            filter: 'agSetColumnFilter',
        },
        {
            headerName: "PO Date",
            field: "created_date",
            cellRenderer: 'DateRenderer',
            filter: 'agDateColumnFilter',
            valueGetter: (params) => params?.data?.created_date ? new Date(params.data?.created_date) : null,
            enableRowGroup: true,
        },
        {
            headerName: "Supplier",
            field: "supplier_name",
            filter: 'agSetColumnFilter',
        },
        {
            headerName: "Status",
            field: "status",
        },
        {
            headerName: "Items",
            field: "line_items.length",
            aggFunc: 'sum',
        },
        {
            headerName: "Total Cost",
            cellRenderer: 'MoneyRenderer',
            valueGetter: (params) => {
                return params?.data?.line_items?.reduce((acc, curr) => acc + curr?.Cost, 0);
            }
        }

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
                    headerName: "Sku Details",
                    openByDefault: false,
                    children: [
                        {
                            headerName: "SKU",
                            field: "SKU",
                        },
                        {
                            headerName: "OEM",
                            columnGroupShow: 'open',
                            ...getJoinedData('manufacturer'),
                        },
                        {
                            headerName: "Category",
                            columnGroupShow: 'open',
                            ...getJoinedData('category'),
                        },
                        {
                            headerName: "Model",
                            columnGroupShow: 'open',
                            ...getJoinedData('model'),
                        },
                        {
                            headerName: "Retail Price",
                            cellRenderer: MoneyRenderer,
                            ...getJoinedData('retail_price'),
                        },
                        {
                            headerName: "Item Cost",
                            columnGroupShow: 'open',
                            cellRenderer: MoneyRenderer,
                            ...getJoinedData('cost'),
                        }
                    ]
                },
                {
                    headerName: "Po Details",
                    children: [
                        {
                            headerName: "Quantity",
                            field: "Quantity",
                        },
                        {
                            headerName: "Cost",
                            field: "Cost",
                            columnGroupShow: 'open',
                            cellRenderer: MoneyRenderer,
                        }
                    ]
                },
                {
                    headerName: "Cost Details",
                    children: [
                        {
                            headerName: "Cost",
                            cellRenderer: MoneyRenderer,
                            valueGetter: (params) => {
                                let poCost = params?.data?.Cost;
                                if( isValidCost(poCost) ) {
                                    return poCost;
                                }
                                let dbCost = lookupValue(skuData, params?.data?.['SKU'], 'cost');
                                if( isValidCost(dbCost) ) {
                                    return dbCost;
                                }
                                return "No Cost Data";
                            },
                        },
                        {
                            headerName: "DB Cost",
                            cellRenderer: BooleanRenderer,
                            columnGroupShow: 'open',
                            valueGetter: (params) => {
                                let data = lookupValue(skuData, params?.data?.['SKU'], 'cost')
                                return isValidCost(data);
                            },
                        },
                        {
                            headerName: "PO Cost",
                            cellRenderer: BooleanRenderer,
                            columnGroupShow: 'open',
                            valueGetter: (params) => {
                                return isValidCost(params?.data?.Cost);
                            }
                        }
                    ]
                },


            ]
        },
        getDetailRowData: params => {
            params.successCallback(params.data.line_items.filter(item => !ignoredSkus.includes(item.SKU)));
        }
    }), [getJoinedData]);
    return (
        <DataGrid
            autoUpdateMasterDetail
            rowData={filteredData}
            columnDefs={columnDefs}
            detailCellRendererParams={detailCellRendererParams}
            masterDetail={true}
            onRowClicked={onRowClicked}
            rowGroupPanelShow={'always'}
            enableCharts
            sidebar={true}
            defaultColDef={{
                enableRowGroup: true,
            }}

        />
    )
}

function OrdersRenderer({ orders, onRowClicked }) {
    const columnDefs = useMemo(() => [
        {
            headerName: "Customer",
            field: "name",
            enableRowGroup: true,
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
            getRowId={getID}
            autoUpdateMasterDetail
            pagination
            rowData={orders}
            columnDefs={columnDefs}
            detailCellRendererParams={detailCellRendererParams}
            masterDetail={true}
            onRowClicked={onRowClicked}
            rowGroupPanelShow={'always'}
            enableCharts
            sidebar={true}
            defaultColDef={{
                enableRowGroup: true,
            }}
        />
    )
}

function SalesRenderer({ SkuSalesData }) {
    const columnDefs = useMemo(() => [
        {
            headerName: "SKU",
            field: "sku",
        },
        {
            headerName: "Name",
            field: "name",
        },
        {
            headerName: "Model",
            field: "model",
        },
        {
            headerName: "Quantity Sold",
            field: "quantity_sold",
        },
        {
            headerName: "Total Sales",
            field: "total_sales",
            cellRenderer: MoneyRenderer,
        },
        {
            headerName: "Order Count",
            field: "order_count",
        },
        {
            headerName: "In Components DB",
            field: "has_component",
            cellRenderer: BooleanRenderer,
        },


    ], []);
    return (
        <DataGrid
            defaultColDef={{
                flex: 1,
                sortable: true,
                filter: true,
            }}
            rowData={SkuSalesData}
            columnDefs={columnDefs}

        />
    )
}


function CombinedRenderer({ filteredData, SkuSalesData }) {
    const getQuantitySold = useCallback((params) => {
        if( !SkuSalesData ) return 0

        let lineItems = params?.data?.['line_items'] ?? [];
        let qtySold = 0;
        for ( let i = 0; i < lineItems.length; i++ ) {
            let sku = lineItems[i]?.['SKU'];
            let salesData = SkuSalesData.find(skuData => skuData.sku === sku);
            if( salesData ) {
                qtySold += +salesData?.['quantity_sold'];
            }
        }
        return Number(qtySold);
    }, [SkuSalesData])

    const getSalesDollars = useCallback((params) => {
        if( !SkuSalesData ) return 0
        let lineItems = params?.data?.['line_items'] ?? [];
        let salesDollars = 0;
        for ( let i = 0; i < lineItems.length; i++ ) {
            let sku = lineItems[i]?.['SKU'];
            let salesData = SkuSalesData.find(skuData => skuData.sku === sku);
            if( salesData ) {
                salesDollars += +salesData?.['total_sales'];
            }
        }
        return Number(salesDollars);
    }, []);

    const columnDefs = useMemo(() => [
        {
            headerName: "Auction House",
            field: "supplier_name",
            sort: 'asc',
            rowGroup: true,
            hide: true,
            flex: 1
        },
        {
            headerName: "Items",
            aggFunc: 'sum',
            valueGetter: (params) => {
                return params?.data?.['line_items']?.reduce((acc, curr) => acc + curr?.Quantity, 0);
            }
        },
        {
            headerName: "Quantity Sold",
            aggFunc: 'sum',
            valueGetter: getQuantitySold
        },
        {
            headerName: "Percent Sold",
            aggFunc: (params) => {
                if( !params?.rowNode?.aggData ) {
                    console.log(params)
                    return 0;
                }
                let valueCols = params.api.getValueColumns();
                let aggData = Object.values(params?.rowNode?.aggData);
                let colMap = new Map();
                for ( let col = 0; col < valueCols.length; col++ ) {
                    let colNam = valueCols[col].colDef.headerName;
                    colMap.set(colNam, aggData[col]);
                }
                let items = colMap.get('Items');
                let sold = colMap.get('Quantity Sold');
                return sold / items;
            },
            cellRenderer: 'PercentageRenderer',
        },
        {
            headerName: "Purchase Cost",
            cellRenderer: 'MoneyRenderer',
            aggFunc: 'sum',
            valueGetter: (params) => {
                return params?.data?.line_items?.reduce((acc, curr) => acc + curr?.Cost, 0);
            }
        },
        {
            headerName: "Sales Dollars",
            aggFunc: 'sum',
            valueGetter: getSalesDollars,
            cellRenderer: MoneyRenderer,
        },
        {
            headerName: "Percent ROI",
            cellRenderer: 'PercentageRenderer',
            aggFunc: (params) => {
                if( !params?.rowNode?.aggData ) {
                    console.log(params)
                    return 0;
                }
                let valueCols = params.api.getValueColumns();
                let aggData = Object.values(params?.rowNode?.aggData);
                let colMap = new Map();
                for ( let col = 0; col < valueCols.length; col++ ) {
                    let colNam = valueCols[col].colDef.headerName;
                    colMap.set(colNam, aggData[col]);
                }
                let cost = colMap.get('Purchase Cost');
                let sales = colMap.get('Sales Dollars');
                if( cost < 1 ) return "Cannot calculate due to missing costs"
                return sales / cost;
            },
        }
    ], [getQuantitySold, getSalesDollars]);

    const autoGroupColumnDef = useMemo(() => ({
        headerName: "Auction House",
        cellRenderer: BasicRenderer,
        cellRendererParams: {
            suppressCount: true,
        }
    }), []);

    const apiRef = useRef(null);

    useEffect(() => {
        const api = apiRef?.current?.api;
        if( !api ) return;
        console.log(api)
        api.refreshClientSideRowModel('aggregate');
    }, [filteredData, columnDefs, apiRef])


    return (
        <DataGrid
            ref={apiRef}
            alwaysAggregateAtRootLevel
            suppressAggFuncInHeader
            rowData={filteredData}
            autoGroupColumnDef={autoGroupColumnDef}
            columnDefs={columnDefs}
        />
    )
}

function infoGraphicsRenderer({}) {
}

function BasicRenderer({ value }) {
    return <Center>{value}</Center>
}

const Index = () => {
    let date = new Date('01-01-2024');
    let startDate = date;
    let endDate = lastDayOfYear(date);
    const { data: SkuSalesData } = useQuery({
        queryKey: ['skuSales'],
        queryFn: async () => {
            return await fetch("/api/views/sales/byItem")
                .then(res => res.json())
        }
    });
    const orders = useOrders(
        {
            startDate,
            endDate
        },
        {
            acceptedConditions: ["1", "2", "3", "4"]
        }
    );

    const { data: purchaseOrders, isPending: purchaseOrdersPending } = useQuery({
        queryKey: ['costSheets'],
        queryFn: async () => {
            return await fetch("/api/views/purchaseOrders")
                .then(res => res.json())
        }
    });
    const filteredData = useMemo(() => {
        if( !purchaseOrders ) return null;
        return purchaseOrders
            .filter(po => {
                let candidate = Number(PurchaseOrderPoNumber(po));
                if( isNaN(candidate) ) {
                    return false
                }
                return poPoNumbers.includes(candidate);
            });
    }, [purchaseOrders]);

    const uniqueItems = useMemo(() => {
        if( !filteredData || filteredData.length === 0 ) return null;
        let skus = new Set();
        if( filteredData ) {
            filteredData.forEach(po => {
                po['line_items'].forEach(item => {
                    let sku = item['SKU'];
                    if( ignoredSkus.includes(sku) ) return;
                    skus.add(sku);
                })
            })
        }
        return Array.from(skus);
    }, [filteredData]);
    const { data: skuData, isPending, isFetching } = useQuery({
        queryKey: ['skuData', uniqueItems],
        enabled: !!uniqueItems,
        queryFn: async () => {
            let response = await fetch("/api/components/list", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ skus: uniqueItems })
            })
            let responseData = await response.json();
            return responseData.reduce((acc, curr) => {
                let sku = curr['sku'];
                if( ignoredSkus.includes(sku) ) return acc
                delete curr['sku'];
                acc[sku] = curr;
                return acc;
            }, {})
        }
    });

    const loadingStates = [
        { name: "Purchase Orders", isPending: purchaseOrdersPending },
        { name: "Sku Data", isPending: isPending, isFetching },
        { name: "Sku Sales Data", isPending: !SkuSalesData },
        { name: "Orders", isPending: orders.length === 0 },
    ]
    const isLoading = loadingStates.map(({ isPending }) => isPending).some(Boolean);

    const getJoinedData = useCallback(joinFactory(skuData), [skuData]);
    const onRowClicked = useCallback((params) => {
        const node = params.node;
        node.setExpanded( !node.expanded);
    }, []);


    return (
        <Box w={'100%'} h={'83.5vh'}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ children: <ComponentLoader loadingStates={loadingStates}/> }}
            />
            <Tabs w={'100%'} h={'100%'} defaultValue="Combined">
                <Tabs.List mb={'sm'}>
                    <Tabs.Tab value="Purchase Orders">
                        Purchase Orders
                    </Tabs.Tab>
                    <Tabs.Tab value="Orders">
                        Orders
                    </Tabs.Tab>
                    <Tabs.Tab value="Sales">
                        Sku Sales Data
                    </Tabs.Tab>
                    <Tabs.Tab value="Combined">
                        Combined
                    </Tabs.Tab>
                    {/*<Tabs.Tab value="Breakdown">*/}
                    {/*    Breakdown*/}
                    {/*</Tabs.Tab>*/}
                </Tabs.List>

                <Tabs.Panel h={'95%'} value="Purchase Orders">
                    <PoRenderer
                        filteredData={filteredData}
                        skuData={skuData}
                        getJoinedData={getJoinedData}
                        onRowClicked={onRowClicked}
                    />
                </Tabs.Panel>

                <Tabs.Panel h={'95%'} value="Orders">
                    <OrdersRenderer
                        orders={orders}
                        onRowClicked={onRowClicked}
                    />
                </Tabs.Panel>
                <Tabs.Panel h={'95%'} value="Sales">
                    <SalesRenderer
                        getJoinedData={getJoinedData}
                        SkuSalesData={SkuSalesData}
                    />
                </Tabs.Panel>

                <Tabs.Panel h={'95%'} value="Combined">
                    <CombinedRenderer
                        filteredData={filteredData}
                        SkuSalesData={SkuSalesData}
                    />
                </Tabs.Panel>
                {/*<Tabs.Panel value="Breakdown">*/}
                {/*    Breakdown tab content*/}
                {/*</Tabs.Panel>*/}
            </Tabs>
        </Box>

    );
};

export default Index;