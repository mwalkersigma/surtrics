import React, {useCallback, useRef, useState} from 'react';
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
import {AgGridReact} from "ag-grid-react";
import {IconCircleCheck, IconCircleLetterI, IconCircleX, IconExternalLink} from "@tabler/icons-react";
import RoleWrapper from "../../../components/RoleWrapper";
import {queryClient} from "../../_app";
import {format, subHours} from "date-fns";
import useUsage from "../../../modules/hooks/useUsage";

const successReasonString = "folder generated"

function ButtonRenderer({value, clickHandler, data, color, hidden}) {
    const [loading, setLoading] = useState(false);
    if (hidden) return <Center h={'100%'}>N/A</Center>
    return <Button color={color} onClick={(e) => clickHandler(data, setLoading, e)}>{value}</Button>
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

function ServerDateRenderer({value}) {
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

    const gridRef = useRef(null);
    const [sheetType, setSheetType] = useState('failure');
    const [searchText, setSearchText] = useState('');
    const {data: opps, isPending} = useQuery({
        queryKey: ["pricingFolders"],
        queryFn: async () => {
            const response = await fetch("/api/views/pricingSheets");
            return response.json();
        }
    });

    const reviewMutation = useMutation({
        mutationFn: async ({data, e}) => {
            e.preventDefault();
            console.log("Marking as reviewed", data['opp_id']);
            return fetch(`/api/priceFolder/review/${data['opp_id']}`, {
                method: "PUT"
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["pricingFolders"]
            }).catch(console.error);
        },
        onError: (error) => {
            console.error("Error marking as reviewed", error);
        }
    })

    const [columnDefs, setColumnDefs] = useState([
        {field: 'id', sortable: true, filter: true, hide: true},
        {field: 'opp_id', sortable: true, filter: true},
        {field: 'outcome', sortable: true, filter: true},
        {field: 'processed_at', sortable: true, filter: true, cellRenderer: ServerDateRenderer},
    ]);
    const [reviewColDefs, setReviewColDefs] = useState([
        ...columnDefs,
        {
            headerName: 'Review',
            cellRenderer: ButtonRenderer,
            cellRendererParams: {
                clickHandler: async (data, setLoading, e) => {
                    setLoading(true);
                    reviewMutation.mutate({data, e});
                    setLoading(false);
                },
                value: 'Rerun',
                color: 'green'
            }
        }
    ])
    const successButtonColumnChange = useCallback(() => {
        if (sheetType === 'success') {
            gridRef.current.api.setGridOption("columnDefs", reviewColDefs);
        } else {
            gridRef.current.api.setGridOption("columnDefs", columnDefs);
        }
    }, [sheetType])

    if (isPending) return <Loader/>


    const dataForGrid = opps.filter((opp) => {
        if (sheetType === 'success') {
            return opp.outcome === successReasonString
        } else {
            return opp.outcome !== successReasonString
        }
    })


    return (
        <RoleWrapper altRoles={['bsa', 'surplus director', 'buying group']}>
            <Container size={'responsive'} h={'80vh'}>
                <Title mt={'md'} mb={'xl'}> Sheet Maker Review </Title>
                <Group align={'flex-start'} mb={'lg'}>
                    <Box>
                        <InputLabel style={{display: "block"}}>Sheet Types</InputLabel>
                        <SegmentedControl
                            value={sheetType}
                            onChange={(e) => {
                                setSheetType(e)
                                successButtonColumnChange()
                            }}
                            label={"Choose sheet type"}
                            data={[
                                {label: 'Failed Opps', value: 'failure'},
                                {label: 'Generated Opps', value: 'success'},
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
                    <AgGridReact
                        quickFilterText={searchText}
                        columnDefs={reviewColDefs}
                        rowData={dataForGrid}
                        ref={gridRef}
                    />
                </div>
            </Container>
        </RoleWrapper>
    );
};

export default Review;