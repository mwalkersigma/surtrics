import {Container, Title} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";
import {useMemo, useState} from "react";
import DataGrid from "../../../components/agGrid";

export default function UsageViewer() {
    const {data: quoteData, isPending: quoteLoading} = useQuery({
        queryKey: ['quotes'],
        queryFn: async () => {
            return await fetch('http://10.100.100.33:4007/api/usage')
                .then(res => res.json())
        }
    });
    const autoGroupColumnDef = useMemo(() => ({
        minWidth: 220,
        cellRendererParams: {
            cellRenderer: 'agTextCellRenderer',
            suppressCount: true,
            icons: {
                sortAscending: "",
                sortDescending: "",
            },
        }
    }), []);
    const [immutableGridState, setImmutableGridState] = useState({
        sideBar: true,
        pagination: true,
        paginationPageSize: 500,
        suppressAggFuncInHeader: true,
        columnDefs: [
            {
                headerName: 'Name',
                hide: true,
                enableRowGroup: true,
                rowGroup: true,
                field: 'salesRep',
            },
            {
                headerName: 'Quote Information',
                openByDefault: false,
                children: [
                    {
                        headerName: 'Customer',
                        field: 'contact',
                        enableRowGroup: true,
                        enableValue: true,
                    },
                    {
                        headerName: 'Opportunity ID',
                        field: 'oppId',
                        columnGroupShow: 'open',
                        enableRowGroup: true,
                        enableValue: true,
                    },
                    {
                        headerName: 'E-Number',
                        field: 'enumber',
                        columnGroupShow: 'open',
                        enableRowGroup: true,
                    },
                ]
            },
            {
                headerName: 'Date',
                field: 'timestamp',
                enableRowGroup: true,
                cellRenderer: 'DateStampRenderer',
                filter: 'agDateColumnFilter',
                chartDataType: "time",
                valueGetter: (params) => {
                    if (params?.data?.timestamp) {
                        return new Date(params.data.timestamp.split(" ")[0])
                    }
                },
            },
            {
                headerName: 'Count',
                aggFunc: 'count',

                cellRenderer: (params) => {
                    if (params.node.group) {
                        return params.node.allChildrenCount
                    }
                }
            },
        ],
        autoGroupColumnDef,
        groupDisplayType: 'multipleColumns',
        paginationPageSizeSelector: [25, 50, 100, 200, 500, 1000, 5000],
        enableCharts: true,
        cellSelection: {
            handle: true
        },
        rowSelection: {
            mode: 'multiRow',
            headerCheckbox: false,
            checkboxes: false
        },
        defaultColDef: {
            sortable: true,
            filter: true,
        },
        rowGroupPanelShow: 'always',
    });

    if (quoteLoading) return <div>Loading...</div>;

    return (<Container size={'responsive'}>
            <Title mb={'lg'} order={1}>Usage</Title>
            <div className="ag-theme-custom" style={{height: "75vh"}}>
                <DataGrid
                    {...immutableGridState}
                    rowData={quoteData}
                />
            </div>
        </Container>
    )
}