import React, {useCallback, useMemo, useState} from 'react';
import DataGrid from "../../../components/agGrid/index.js";
import {
    Autocomplete,
    Badge,
    Button,
    Center,
    CloseButton,
    Container,
    Flex,
    Grid,
    Group,
    Loader,
    LoadingOverlay,
    Modal,
    NumberFormatter,
    Select,
    Tabs,
    Text,
    Textarea,
    TextInput,
    Title
} from "@mantine/core";
import useOrders from "../../../modules/hooks/useOrders.js";
import {storeNames} from "../../../modules/constants.js";
import {IconCircleCheck} from "@tabler/icons-react";
import {useDebouncedState, useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {DatePickerInput} from "@mantine/dates";
import {toHeaderCase} from "js-convert-case";
import {useMutation, useQuery} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import {queryClient} from "../../_app.js";
import useUsage from "../../../modules/hooks/useUsage.js";
import {subMonths} from "date-fns";


const ISSUES = [
    'Photography',
    'Model ID',
    'Location',
    'Description',
    'Condition',
    'Quantity',
    'Unprocessed',
    'Breakdown',
    'Damaged',
    'Banned',
    'Classification',
    'Nonstandard Prep',
    'Mixed Bag',
    'Printing',
    'Defective'
];
const STATUSES = [
    'Shipped',
    'Awaiting Decision',
    'Cancelled',
    'Quantity Adjusted',
    'Discount Applied',
    'Sourcing',
    'Order Status'
];

const issueOptions = {
    "Photography": {
        color: '#f254e5'
    },
    "Model ID": {
        color: '#0a53a8'
    },
    "Location": {
        color: '#3b7822'
    },
    "Description": {
        color: '#c98fe5'
    },
    "Condition": {
        color: '#eda6a6'
    },
    "Quantity": {
        color: '#d4efbe'
    },
    "Unprocessed": {
        color: '#d1e1f2'
    },
    "Breakdown": {
        color: '#6948a5'
    },
    "Damaged": {
        color: '#f39a34'
    },
    "Banned": {
        color: '#b10202'
    },
    "Classification": {
        color: '#753800'
    },
    "Nonstandard Prep": {
        color: '#78f6ff'
    },
    "Mixed Bag": {
        color: '#ffe5a0'
    },
    "Printing": {
        color: '#3d3d3d'
    },
    "Defective": {
        color: '#e8eaed'
    },
};

function statusOptions(status) {
    let config;
    switch (status) {
        case 'Shipped':
            config = {color: 'green', label: 'Shipped'}
            break;
        case 'Awaiting Decision':
            config = {color: 'blue', label: 'Awaiting Decision'}
            break;
        case 'Cancelled':
            config = {color: 'red', label: 'Cancelled'}
            break;
        case 'Quantity Adjusted':
            config = {color: 'purple', label: 'Quantity Adjusted'}
            break;
        case 'Discount Applied':
            config = {color: 'orange', label: 'Discount Applied'}
            break;
        case 'Sourcing':
            config = {color: 'yellow', label: 'Sourcing'}
            break;
        default:
            config = {color: 'gray', label: 'Unknown'}
            break;
    }
    return config;
}


function LoadingRenderer({name, loading}) {
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

function ComponentLoader({loadingStates}) {
    if (!loadingStates) return null;
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

export function MoneyRenderer({value, newValue}) {
    if (value === null && newValue) return "Not Provided"
    if (newValue) return <NumberFormatter
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

function OrdersTable({orders, handleSubmitIssue}) {
    const [quickSearch, setQuickSearch] = useDebouncedState('', 500);
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
                    columnGroupShow: 'open',
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
        {
            headerName: "Actions",
            cellRenderer: 'ButtonRenderer',
            cellRendererParams: {
                label: 'Submit Issue',
                onClick: handleSubmitIssue
            },
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
    const defaultColDef = useMemo(() => ({
        enableRowGroup: true,
    }), []);

    return (
        <>
            <TextInput
                w={'50%'}
                label={'Search'}
                placeholder={'Enter any value from any column'}
                defaultValue={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                mb={'xl'}
            />
            <DataGrid
                getRowId={getID}
                autoUpdateMasterDetail
                pagination
                rowData={orders}
                columnDefs={columnDefs}
                quickFilterText={quickSearch}
                detailCellRendererParams={detailCellRendererParams}
                masterDetail={true}
                rowGroupPanelShow={'always'}
                enableCharts
                sidebar={true}
                defaultColDef={defaultColDef}
            />
        </>

    )
}

function SubmitIssueForm({order, close}) {
    if (!order) return null;
    const form = useForm({
        initialValues: {
            orderNumber: order?.orderId,
            orderStatus: toHeaderCase(order?.orderStatus),
            date: new Date(),
            location: "",
            sku: "",
            quantity: 0,
            issue: "",
            notes: "",
        }
    });

    const issueMutation = useMutation({
        mutationFn: async (issueData) => {
            const orderNumber = issueData?.orderNumber;
            const orderStatus = issueData?.orderStatus;
            const date = issueData?.date;
            const location = issueData?.location;
            const sku = issueData?.sku;
            const quantity = issueData?.quantity;
            const issue = issueData?.issue;
            const notes = issueData?.notes;

            return await fetch('/api/dataEntry/orderIssues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderNumber,
                    orderStatus,
                    date,
                    location,
                    sku,
                    quantity,
                    issue,
                    notes,
                })
            }).then(res => res.json())

        },
        onSettled: (response) => {
            close();
            notifications.show({
                title: 'Issue Submitted',
                message: response.message,
                color: 'blue'
            })

            return queryClient.invalidateQueries({
                queryKey: ['issues']
            })
        }
    });

    return (
        <Container size={'100%'}>
            <Title mb={'lg'}> Submit Order Issue </Title>
            <Text mb={'sm'}> {order.name} </Text>
            <Text>
                <Text span c={'dimmed'}> Order Total: {" "} </Text>
                <NumberFormatter value={order.total} prefix={'$'} thousandSeparator={','} decimalScale={2}
                                 fixedDecimalScale/>
            </Text>
            <Group mb={'lg'} align={'center'}>
                <Text c={'dimmed'}> Order Status: </Text>
                <Badge> {toHeaderCase(order.orderStatus)} </Badge>
            </Group>
            <form onSubmit={form.onSubmit(issueMutation.mutate)}>
                <Grid mb={'xl'}>
                    <Grid.Col span={3}>
                        <TextInput
                            label={'Order Number'}
                            required
                            disabled
                            {...form.getInputProps('orderNumber')}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Autocomplete
                            label={'Order Status'}
                            rightSection={form.getValues().orderStatus !== '' &&
                                <CloseButton onClick={() => form.setFieldValue('orderStatus', '')}/>}
                            data={STATUSES}
                            {...form.getInputProps('orderStatus')}
                        />

                    </Grid.Col>
                    <Grid.Col span={3}>
                        <DatePickerInput
                            label="Date"
                            placeholder="Select date"
                            required
                            {...form.getInputProps('date')}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            label={'Location'}
                            required
                            {...form.getInputProps('location')}
                        />
                    </Grid.Col>

                    <Grid.Col span={8}>
                        <Select
                            label={'Item'}
                            required
                            searchable
                            placeholder={'Select Item'}
                            data={order?.items?.map(item => ({
                                value: String(item.sku),
                                label: `${item.name} - ${item.sku}`
                            })) ?? []}
                            {...form.getInputProps('sku')}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput
                            label={'Quantity'}
                            type={'number'}
                            required
                            {...form.getInputProps('quantity')}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Autocomplete
                            label={'Issue'}
                            placeholder={'Select Issue'}
                            required
                            data={ISSUES}
                            {...form.getInputProps('issue')}

                        />
                    </Grid.Col>
                    {/*<Grid.Col span={4}>*/}
                    {/*    <NumberInput*/}
                    {/*        label={'Amount Refunded'}*/}
                    {/*        prefix={'$'}*/}
                    {/*        required*/}
                    {/*        {...form.getInputProps('amountRefunded')}*/}
                    {/*    />*/}
                    {/*</Grid.Col>*/}

                    <Grid.Col span={12}>
                        <Textarea
                            label={'Notes'}
                            placeholder={'Enter Notes'}
                            {...form.getInputProps('notes')}
                        />
                    </Grid.Col>
                    {/*<Grid.Col span={12}>*/}
                    {/*    <Group>*/}
                    {/*        <Switch*/}
                    {/*            label={'CS'}*/}
                    {/*            {...form.getInputProps('cs', {type: 'checkbox'})}*/}
                    {/*        />*/}
                    {/*        <Switch*/}
                    {/*            label={'Returned'}*/}
                    {/*            {...form.getInputProps('returned', {type: 'checkbox'})}*/}
                    {/*        />*/}
                    {/*    </Group>*/}
                    {/*</Grid.Col>*/}
                    {/*<Grid.Col span={12}>*/}
                    {/*    <Textarea/>*/}
                    {/*</Grid.Col>*/}
                    <Grid.Col span={8}></Grid.Col>
                    <Grid.Col span={4}>
                        <Center mt={'1.5rem'}>
                            <Button fullWidth type={'submit'}> Submit </Button>
                        </Center>
                    </Grid.Col>

                </Grid>
            </form>
        </Container>
    )
}

function statusRenderer({value}) {
    if (!value) return null
    return <Center h={'100%'}>
        <Badge autoContrast size={'md'} color={statusOptions(value).color}>
            {statusOptions(value).label}
        </Badge>
    </Center>
}

function issueRenderer({value}) {
    if (!value) return null
    return (
        <Center h={'100%'}>
            <Badge autoContrast size={'md'} color={issueOptions?.[value]?.color}>
                {value}
            </Badge>
        </Center>
    )
}

function IssuesTable({issues, orders}) {
    const [quickSearch, setQuickSearch] = useDebouncedState('', 500);

    const issueDataSet = useMemo(() => {
        if (!issues || !orders) return [];
        return issues.map(issue => {
            let base = {...issue};
            base.order = orders.find(order => order.orderId === issue.order_id);
            return base;
        });
    }, [issues, orders]);


    const columnDefs = useMemo(() => [
        {
            headerName: 'Order Details',
            children: [
                {
                    headerName: 'Customer',
                    field: 'order.name',
                    columnGroupShow: 'open',
                    editable: false,
                },
                {
                    headerName: 'Order #',
                    field: 'order_id',
                    cellDataType: 'number',
                    width: 120,
                    editable: false,
                    valueGetter: params => Number(params?.data?.order_id ?? 0),
                },
                {
                    headerName: 'Order Total',
                    field: 'order.total',
                    cellRenderer: MoneyRenderer,
                    columnGroupShow: 'open',
                    editable: false,
                },
                {
                    headerName: 'Order Status',
                    field: 'status',
                    cellEditor: "agRichSelectCellEditor",
                    cellRenderer: statusRenderer,
                    cellEditorParams: {
                        values: STATUSES,
                        cellRenderer: statusRenderer,

                    },

                },
                {
                    headerName: 'Item Details',
                    children: [
                        {
                            headerName: 'SKU',
                            field: 'sku',
                            editable: false,
                        },
                    ]
                },
            ]
        },
        {
            headerName: 'Issue Details',
            children: [
                {
                    headerName: 'Issue Date',
                    field: 'date_created',
                    cellRenderer: 'DateRenderer',
                    valueGetter: (params) => params?.data?.['date_created'] ? new Date(params.data['date_created']) : null,
                    cellDataType: 'date',
                    filter: 'agDateColumnFilter',
                    cellEditor: "agDateCellEditor",
                },
                {
                    headerName: 'Issue',
                    field: 'issue',
                    cellRenderer: issueRenderer,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: {
                        values: ISSUES,
                        cellRenderer: issueRenderer
                    }
                },
                {
                    headerName: 'Quantity',
                    field: 'quantity',
                    columnGroupShow: 'open',
                    cellEditor: "agNumberCellEditor",
                    cellEditorParams: {
                        precision: 0,
                    },
                },
                {
                    headerName: 'Location',
                    field: 'location',
                    columnGroupShow: 'open',
                },
                {
                    headerName: 'Notes',
                    field: 'notes',
                    cellEditor: "agLargeTextCellEditor",
                    cellEditorPopup: true,
                },
            ]
        },
        {
            headerName: 'Customer Service Details',
            groupId: 'GroupA',
            children: [
                {
                    headerName: 'Details',
                    columnGroupShow: 'closed',
                    width: 320,

                    valueGetter: (params) => {
                        let cs = params.data.cs;
                        let returned = params.data.returned;
                        let resolved = params.data.resolved;
                        return [cs, returned, resolved]
                    },
                    onCellClicked: (params) => {
                        console.log(params.api.setColumnGroupOpened('GroupA', true))
                        params.api.setColumnGroupOpened('GroupA', true)
                    },
                    cellRenderer: (params) => {
                        const [cs, returned, resolved] = params?.value;
                        return (
                            <Center h={'100%'}>
                                <Group>
                                    <Badge color={cs ? 'green' : 'gray'}>CS</Badge>
                                    <Badge color={returned ? 'red' : 'gray'}>Returned</Badge>
                                    <Badge color={resolved ? 'green' : 'gray'}>Resolved</Badge>
                                </Group>
                            </Center>
                        )
                    },
                },
                {
                    headerName: 'Customer Service',
                    field: 'cs',
                    cellEditor: "agCheckboxCellEditor",
                    columnGroupShow: 'open',
                },
                {
                    headerName: 'Returned',
                    field: 'returned',
                    cellEditor: "agCheckboxCellEditor",
                    columnGroupShow: 'open',
                },
                {
                    headerName: 'Resolved',
                    field: 'resolved',
                    cellEditor: "agCheckboxCellEditor",
                    columnGroupShow: 'open',
                },
                {
                    headerName: 'Amount Refunded',
                    field: 'refund_amount',
                    cellRenderer: MoneyRenderer,
                    cellEditor: "agNumberCellEditor",
                    cellEditorParams: {
                        precision: 2,
                    },
                },
                {
                    headerName: 'Outcome',
                    field: 'outcome',
                    cellEditor: "agLargeTextCellEditor",
                    cellEditorPopup: true,
                }
            ]
        },
    ], []);
    const getID = useCallback((params) => {
        return String(params.data.id)
    }, []);
    const defaultColDef = useMemo(() => ({
        editable: true,
    }), []);
    const handleCellEdit = useCallback((params) => {
        if (!params.data.id) return;
        let newValue = params.newValue;
        let oldValue = params.oldValue;
        if (newValue === oldValue) return;
        const body = {
            id: params.data.id,
            column: params.column.colId,
            value: newValue
        };
        return fetch('/api/dataEntry/orderIssues', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
    }, []);
    const gridUpdateMutation = useMutation({
        mutationFn: handleCellEdit,
        onMutate: async (params) => {
            await queryClient.cancelQueries(['issues']);
            const previousIssuesState = queryClient.getQueryData(['issues']);

            // using the transaction API
            const oldData = params.data;
            const newData = {...oldData}
            newData[params.column.colId] = params.newValue;
            console.log(`Optimistically updating ${oldData.id} with ${params.column.colId} to ${params.newValue}`)
            params.api.applyTransaction({update: [newData]});

            return {previousIssuesState}

        },
        onError: (error, variables, context) => {
            console.log(" Update Errored!")
            console.log(error)
            return queryClient.setQueryData(['issues'], context.previousIssuesState)
        },
        onSettled: () => {
            console.log("Update Settled!")
            return queryClient.invalidateQueries({queryKey: ['issues']})
        }
    });

    return (
        <>
            <TextInput
                w={'50%'}
                label={'Search'}
                placeholder={'Enter any value from any column'}
                defaultValue={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                mb={'xl'}

            />
            <DataGrid
                getRowId={getID}
                readOnlyEdit={true}
                rowData={issueDataSet}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onCellEditRequest={gridUpdateMutation.mutate}
                sideBar={{
                    toolPanels: ['columns', 'filters']
                }}
                quickFilterText={quickSearch}
            />
        </>
    )
}

const Index = () => {
    useUsage("Ecommerce", "QA-Orders")
    let endDate = new Date();
    let startDate = subMonths(endDate, 6)
    const orders = useOrders(
        {
            startDate,
            endDate
        },
        {
            acceptedConditions: ["1", "2", "3", "4"]
        }
    );

    const {data: issues} = useQuery({
        queryKey: ['issues'],
        queryFn: async () => {
            return await fetch('/api/dataEntry/orderIssues')
                .then(res => res.json())
        }
    });

    const [order, setOrder] = useState(null);
    const [modalOpen, {open, close}] = useDisclosure();


    const loadingStates = [
        {name: "Orders", isPending: orders.length === 0},
    ]
    const isLoading = loadingStates.map(({isPending}) => isPending).some(Boolean);


    const handleSubmitIssue = useCallback((order) => {
        setOrder(order);
        open();
    }, []);


    return (
        <Container size={'responsive'} h={'75vh'}>
            <Modal size={'85%'} opened={modalOpen} onClose={() => {
                close();
                setOrder(null)
            }}>
                <SubmitIssueForm close={close} order={order}/>
            </Modal>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{radius: 'sm', blur: 2}}
                loaderProps={{children: <ComponentLoader loadingStates={loadingStates}/>}}
            />
            <Tabs h={'100%'} defaultValue={'orders'}>
                <Tabs.List variant={'dashed'} mb={'md'}>
                    <Tabs.Tab value={'orders'}>
                        Orders
                    </Tabs.Tab>
                    <Tabs.Tab value={'issues'}>
                        Issue
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel h={'87%'} value={'orders'}>
                    <OrdersTable
                        orders={orders}

                        handleSubmitIssue={handleSubmitIssue}
                    />
                </Tabs.Panel>
                <Tabs.Panel h={'87%'} value={'issues'}>
                    <IssuesTable
                        orders={orders}
                        issues={issues}
                    />
                </Tabs.Panel>
            </Tabs>

        </Container>

    );
};

export default Index;