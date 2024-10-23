import React, {useState} from 'react';
import {
    Box,
    Button,
    Center,
    Container,
    Group,
    InputLabel,
    Loader,
    SegmentedControl,
    TextInput,
    Title,
    Tooltip
} from "@mantine/core";
import {useMutation, useQuery} from "@tanstack/react-query";
import {IconCircleCheck, IconCircleLetterI, IconCircleX, IconExternalLink} from "@tabler/icons-react";
import RoleWrapper from "../../../components/RoleWrapper";
import {queryClient} from "../../_app";
import {format, subHours} from "date-fns";
import useUsage from "../../../modules/hooks/useUsage";
import DataGrid from "../../../components/agGrid";


function ButtonRenderer({value, clickHandler, data, color}) {
    const [loading, setLoading] = useState(false);
    return <Button c={color} onClick={(e) => clickHandler(data, setLoading, e)}>{value}</Button>
}

function ExternalLinkRenderer({href, data}) {
    return (
        <Button rightSection={<IconExternalLink/>} component={'a'} href={href(data.sheet_id)}>View Sheet</Button>
    )
}

function BooleanRenderer({value}) {
    return <Center h={'100%'}>{value ? <IconCircleCheck color={'var(--mantine-color-green-5)'}/> :
        <IconCircleX color={'var(--mantine-color-red-5)'}/>}</Center>;
}

function serverDateRenderer({value}) {
    try {
        if (process.env.NODE_ENV === "development") {
            return <Center h={'100%'}>{format(subHours(new Date(value), 5), "Pp")}</Center>;
        }
        return <Center h={'100%'}>{format(subHours(new Date(value), 0), "Pp")}</Center>;
    } catch (e) {
        console.error(e);
        console.error(value);
        return <Center h={'100%'}>Invalid Date</Center>
    }
}
const Review = () => {
    useUsage("admin", "drive-parser-review")
    const SheetStates = {
        "Pricing Sheets": [
            "Sheet is currently in OPEN status and has not been updated in 60 or more days",
            "Sheet has not had cost put in for 60 or more days and is suspended in Insightly"
        ],
        "Cost Sheets": [
            "No items to process",
            "PO Number could not be determined",
            "Supplier Name could not be determined",
            "Some items were skipped because they had no SKU or Quantity",
            "PO Failed because of a bad SKU. It also could not be fixed automatically",
        ],
    }

    const [sheetType, setSheetType] = useState('Cost Sheets');
    const [searchText, setSearchText] = useState('');
    const {data: costSheets, isPending} = useQuery({
        queryKey: ["costSheets"],
        queryFn: async () => {
            const response = await fetch("/api/views/costSheets");
            return response.json();
        }
    });
    const reviewMutation = useMutation({
        mutationFn: async ({data, e}) => {
            e.preventDefault();
            console.log("Marking as reviewed", data['sheet_id']);
            return fetch(`/api/costSheet/review/${data['sheet_id']}`, {
                method: "PUT"
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["costSheets"]
            }).catch(console.error);
        },
        onError: (error) => {
            console.error("Error marking as reviewed", error);
        }
    })

    const [columnDefs, setColumnDefs] = useState([
        {field: 'id', sortable: true, filter: true, width: 125, hide: true},
        {field: 'update_date', sortable: true, filter: true, cellRenderer: serverDateRenderer, width: 180},
        {field: 'sheet_name', sortable: true, filter: true, width: 200},
        {field: 'sheet_failure_reason', sortable: true, filter: true, flex: 1},
        {
            headerName: "Review Data",
            openByDefault: false,
            children: [
                {
                    field: 'is_reviewed',
                    headerName: "Reviewed",
                    width: 150,
                    sortable: true,
                    filter: true,
                    cellRenderer: BooleanRenderer
                },
                {field: 'who_reviewed', sortable: true, filter: true, columnGroupShow: 'open',}
            ]
        },

        {field: 'sheet_id', hide: true},
        {
            headerName: 'Actions',
            openByDefault: true,
            children: [
                {
                    headerName: 'Link',
                    cellRenderer: ExternalLinkRenderer,
                    cellRendererParams: {
                        link: true,
                        href: (id) => `https://docs.google.com/spreadsheets/d/${id}/edit?gid=0#gid=0`
                    }
                },
                {
                    headerName: 'Review',
                    cellRenderer: ButtonRenderer,
                    cellRendererParams: {
                        clickHandler: async (data, setLoading, e) => {
                            if (!confirm("Are you sure you want to mark this ready to parse?")) return;
                            setLoading(true);
                            reviewMutation.mutate({data, e});
                            setLoading(false);
                        },
                        value: 'Mark as Reviewed',
                    }
                }
            ]
        },

    ]);
    if (isPending) return <Loader/>

    let dataForGrid = costSheets.filter((sheet) => {
        return SheetStates[sheetType].includes(sheet?.['sheet_failure_reason']);
    })

    return (
        <RoleWrapper altRoles={['bsa', 'surplus director', 'buying group']}>
            <Container size={'responsive'} h={'80vh'}>
                <Title mt={'md'} mb={'xl'}> Drive Parser Review </Title>
                <Group align={'flex-start'} mb={'lg'}>
                    <Box>
                        <InputLabel style={{display: "block"}}>Sheet Types</InputLabel>
                        <SegmentedControl
                            value={sheetType}
                            onChange={setSheetType}
                            label={"Choose sheet type"}
                            data={[
                                {label: 'Cost Sheets', value: 'Cost Sheets'},
                                {label: 'Pricing Sheets', value: 'Pricing Sheets'},
                            ]}
                        />
                    </Box>
                </Group>

                <Group align={'flex-start'} width={'100%'}>
                    <TextInput
                        mb={'xl'}
                        label={'Search'}
                        placeholder={'Search any field or multiple fields'}
                        description={'The search feature can handle multiple searches separated by a space E.G Sales Leadership In-Person'}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        w={'75%'}
                    />
                    <Tooltip
                        label={'The search feature works across every field, so you can filter down pretty quickly'}>
                        <IconCircleLetterI color={'gray'}/>
                    </Tooltip>
                </Group>

                <div style={{height: "55vh"}} className="ag-theme-custom">
                    <DataGrid
                        quickFilterText={searchText}
                        columnDefs={columnDefs}
                        rowData={dataForGrid}
                    />
                </div>
            </Container>
        </RoleWrapper>
    );
};

export default Review;