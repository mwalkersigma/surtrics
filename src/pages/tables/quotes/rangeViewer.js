import {Container, Title} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";
import {useMemo, useState} from "react";
import DataGrid from "../../../components/agGrid";

export default function UsageViewer() {
    const {data: quoteData, isPending: quoteLoading} = useQuery({
        queryKey: ['quotes'],
        queryFn: async () => {
            return await fetch('http://10.100.100.33:3007/api/usage')
                .then(res => res.json())
        }
    })
    let data = quoteData;

    const [[startDate, endDate], setDates] = useState([null, null]);

    if (startDate || endDate) {
        data = data.filter((row) => {
            return new Date(row.timestamp) >= startDate && new Date(row.timestamp) <= endDate;
        });
    }
    const autoGroupColumnDef = useMemo(() => ({
        headerValueGetter: () => {
            return "Grouped Values";
        },
        minWidth: 220,
        sortable: false,
        cellRendererParams: {
            cellRenderer: 'agTextCellRenderer',
            suppressCount: false,
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
        columnDefs: [
            {
                headerName: 'Name',
                hide: true,
                enableRowGroup: true,
                rowGroup: true,
                field: 'salesRep',
            },
            {
                headerName: 'Customer',
                field: 'contact',
                sortable: true,
                enableRowGroup: true,
                aggFunc: 'count',
            },
            {
                headerName: 'Opportunity ID',
                field: 'oppId',
                sortable: true,
            },
            {
                headerName: 'E-Number',
                field: 'enumber',
                sortable: true,

            },

            {
                headerName: 'Date',
                field: 'timestamp',
                enableRowGroup: true,
                cellRenderer: 'DateRenderer',
                valueGetter: (params) => {
                    if (params?.data?.timestamp) {
                        return new Date(params.data.timestamp)
                    }
                },
                sortable: true,
            },

        ],
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
    console.log(data)


    if (quoteLoading) return <div>Loading...</div>;

    return (<Container size={'responsive'}>
            <Title my={'xl'} order={1}>Usage</Title>
            <div className="ag-theme-custom" style={{height: "61vh"}}>
                <DataGrid
                    {...immutableGridState}
                    autoGroupColumnDef={autoGroupColumnDef}
                    rowData={data}
                />
            </div>
        </Container>
    )
}