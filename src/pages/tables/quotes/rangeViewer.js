import {Container, Title} from "@mantine/core";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
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

    const usage = data?.reduce((acc, curr) => {
        let salesRepName = curr.salesRep;
        if (!acc[salesRepName]) {
            acc[salesRepName] = {
                firstName: salesRepName.split(' ')[0],
                lastName: salesRepName.split(' ')[1],
                count: 0,
                names: []
            };
        }
        acc[salesRepName].count += 1;
        acc[salesRepName].names.push({
            name: curr.contact,
            enumber: curr.enumber,
            oppId: curr.oppId,
            date: curr.timestamp
        });
        return acc;
    }, {});
    if (!usage) return <div>Loading...</div>;

    return (<Container size={'responsive'}>
            <Title my={'xl'} order={1}>Usage</Title>
            <CustomRangeMenu my={'xl'} label={'Date Range'} subscribe={setDates} defaultValue={[null, null]}/>
            <div className="ag-theme-custom" style={{height: "61vh"}}>
                <DataGrid
                    masterDetail={true}
                    columnDefs={[
                        {field: 'firstName', sortable: true, filter: true, cellRenderer: 'agGroupCellRenderer'},
                        {field: 'lastName', sortable: true, filter: true},
                        {field: 'count', sortable: true, filter: true},
                    ]}
                    defaultColDef={{flex: 1}}
                    detailCellRendererParams={{
                        detailGridOptions: {
                            columnDefs: [
                                {field: 'name', sortable: true, filter: true},
                                {field: 'enumber', sortable: true, filter: true},
                                {field: 'oppId', sortable: true, filter: true},
                                {field: 'date', sortable: true, filter: true},
                            ],
                            defaultColDef: {flex: 1},
                        },
                        getDetailRowData: function (params) {
                            params.successCallback(params.data.names);
                        },
                    }}
                    rowData={Object.values(usage)}
                />
            </div>
        </Container>
    )
}