import React, {useMemo, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {Box, Center, Container, Group, Loader, Progress, Space, Text, TextInput, Title, Tooltip} from "@mantine/core";
import {IconCircleCheck, IconCircleLetterI, IconCircleX} from "@tabler/icons-react";
import {format, formatDuration, intervalToDuration, subHours} from "date-fns";
import RoleWrapper from "../../../components/RoleWrapper";
import {AgGridReact} from "ag-grid-react";
import {StatsGroup} from "../../../components/StatsGroup/StatsGroup";


function DurationRenderer({value}) {
    return <Center h={'100%'}>{formatDuration(value)}</Center>;
}

function BooleanRenderer({value}) {
    return <Center h={'100%'}>{value ? <IconCircleCheck color={'var(--mantine-color-green-5)'}/> :
        <IconCircleX color={'var(--mantine-color-red-5)'}/>}</Center>;
}

function DateRenderer({value}) {
    try {
        return <Center h={'100%'}>{format(new Date(value), "Pp")}</Center>;
    } catch (e) {
        console.error(e);
        console.error(value);
        return <Center h={'100%'}>Invalid Date</Center>
    }
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

function BreakdownRender({value}) {
    const {
        percent_time_sleeping,
        percent_time_waiting_for_drive_parser_api,
        percent_time_processing_local_files
    } = value;
    return (<Progress.Root size={40}>
        <Tooltip label="Time Sleeping">
            <Progress.Section value={Number(percent_time_sleeping)} color={'blue'}>
                <Progress.Label> Time Sleeping </Progress.Label>
            </Progress.Section>
        </Tooltip>
        <Tooltip label={'Waiting for Drive Parser API'}>
            <Progress.Section value={Number(percent_time_waiting_for_drive_parser_api)} color={'red'}>
                <Progress.Label> Waiting for Drive Parser API </Progress.Label>
            </Progress.Section>
        </Tooltip>
        <Tooltip label={'Processing local files'}>
            <Progress.Section value={Number(percent_time_processing_local_files)} color={'green'}>
                <Progress.Label> Processing local files </Progress.Label>
            </Progress.Section>
        </Tooltip>
    </Progress.Root>)
}

function durationToSeconds(duration) {
    return (duration?.minutes ?? 0) * 60 + (duration?.seconds ?? 0);
}

function secondsToDuration(seconds) {
    return {
        hours: Math.floor(seconds / 3600),
        minutes: Math.floor(seconds / 60) % 60,
        seconds: Math.floor(seconds * 100) / 100 % 60
    }
}

function averageDuration(data) {
    // duration = {hours: 0, minutes: 0, seconds: 0}
    return data
        .map(durationToSeconds)
        .reduce((acc, curr) => acc + curr, 0) / data.length;
}

function minDuration(data) {
    return data
        .map(durationToSeconds)
        .reduce((acc, curr) => Math.min(acc, curr), Infinity);
}

function durationComparator(a, b) {
    let aSeconds = durationToSeconds(a);
    let bSeconds = durationToSeconds(b);
    if (aSeconds === bSeconds) return 0;
    return aSeconds - bSeconds;
}


const Stats = () => {
    const [searchText, setSearchText] = useState('');
    const {data: runs, isPending} = useQuery({
        queryKey: ["runs"],
        queryFn: async () => {
            console.log("Updating")
            const response = await fetch("/api/views/costSheets/runs");
            return response.json();
        },
        refetchInterval: 1000 * 60,
    })
    const [columnDefs, setColumnDefs] = useState([
        {field: 'id', width: 90, sortable: true, filter: true, hide: true},
        {
            headerName: 'Time Stamps',
            openByDefault: false,
            children: [
                {field: 'start_date', sortable: true, filter: true, cellRenderer: serverDateRenderer,},
                {
                    field: 'end_date',
                    sortable: true,
                    filter: true,
                    cellRenderer: serverDateRenderer,
                    columnGroupShow: 'open'
                },
                {
                    headerName: "Record Create Date",
                    field: 'create_date',
                    sortable: true,
                    filter: true,
                    cellRenderer: DateRenderer,
                    columnGroupShow: 'open'
                },
            ]
        },
        {
            headerName: 'Execution Time',
            openByDefault: false,
            children: [
                {
                    field: 'execution_time',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    comparator: durationComparator,
                },
                {
                    field: 'time_sleeping',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    comparator: durationComparator,
                },
                {
                    field: 'time_waiting_for_drive_parser_api',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    comparator: durationComparator,
                },
                {
                    field: 'time_processing_local_files',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    comparator: durationComparator,
                },
                {
                    field: 'time_per_call_to_drive_parser_api',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    comparator: durationComparator,
                },
            ]
        },
        {field: 'completed', cellRenderer: BooleanRenderer, sortable: true, filter: true, width: 150},
        {
            headerName: "File Processing",
            openByDefault: false,
            children: [
                {field: 'total_files', sortable: true, filter: true, columnGroupShow: 'open'},
                {
                    headerName: "Files Skipped",
                    valueGetter: (params) => params.data['total_files'] - params.data['files_processed'],
                    columnGroupShow: 'open'
                },
                {
                    field: 'files_skipped',
                    headerName: "Suspended Sheets",
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open'
                },
                {field: 'files_processed', sortable: true, filter: true},
            ]
        },
        {field: 'pos_generated', sortable: true, filter: true},
        {field: 'calls_to_drive_parser_api', sortable: true, filter: true},
        {
            headerName: 'Percentages',
            openByDefault: false,
            children: [
                {
                    headerName: "Breakdown",
                    columnGroupShow: 'closed',
                    cellRenderer: BreakdownRender,
                    valueGetter: (params) => params.data,
                    width: 500
                },
                {
                    field: 'percent_time_sleeping',
                    sortable: true,
                    filter: true,
                    cellDataType: 'percentage',
                    columnGroupShow: 'open'
                },
                {
                    field: 'percent_time_waiting_for_drive_parser_api',
                    sortable: true,
                    filter: true,
                    cellDataType: 'percentage',
                    columnGroupShow: 'open'
                },
                {
                    field: 'percent_time_processing_local_files',
                    sortable: true,
                    filter: true,
                    cellDataType: 'percentage',
                    columnGroupShow: 'open'
                },
                {
                    field: 'percent_time_per_call_to_drive_parser_api',
                    sortable: true,
                    filter: true,
                    cellDataType: 'percentage',
                    columnGroupShow: 'open'
                },
            ]
        },


    ]);
    const dataTypeDefinitions = useMemo(() => {
        return {
            percentage: {
                extendsDataType: 'number',
                baseDataType: 'number',
                valueFormatter: params => params.value == null
                    ? ''
                    : `${Math.round(params.value * 100) / 100}%`,
            }
        };
    }, []);
    if (isPending) return <Loader/>
    const mostRecentRun = runs.sort((a, b) => new Date(b['start_date']) - new Date(a['start_date']))[0];
    const averageDurationSeconds = Math.trunc(averageDuration(runs.map(run => run['execution_time'])) * 100) / 100 * 1000;
    const averageProcessingTime = Math.trunc(averageDuration(runs.map(run => run['time_processing_local_files'])) * 100) / 100 * 1000;

    return (
        <RoleWrapper altRoles={['bsa', 'surplus director']}>
            <Container size={'responsive'} h={'80vh'}>
                <Group>
                    <Title mt={'md'} mb={'xl'}> Drive Parser Health </Title>
                    <Text fz={'sm'} c={'dimmed'}> Most Recent
                        Run: {format(new Date(mostRecentRun['start_date']), "Pp")}</Text>
                </Group>
                <Box px={'1rem'} mb={'xl'}>
                    <StatsGroup data={[
                        {
                            title: "Total Runs",
                            stats: runs.length,
                            description: "Total runs executed"
                        },
                        {
                            title: "Average Execution Time",
                            stats: formatDuration(intervalToDuration({
                                start: 0,
                                end: averageDurationSeconds
                            })).replace("minutes", "min").replace("seconds", "sec"),
                            description: "Average time per run"
                        },
                        {
                            title: "Best Execution Time",
                            stats: formatDuration(secondsToDuration(minDuration(runs.map(run => run['execution_time'])))).replace("minutes", "min").replace("seconds", "sec"),
                            description: "Best time per run"
                        },
                        {
                            title: "Average Processing Time",
                            stats: formatDuration(intervalToDuration({
                                start: 0,
                                end: averageProcessingTime
                            })).replace("minutes", "min").replace("seconds", "sec"),
                            description: "Time not waiting for API or Sleeping"
                        }
                    ]}/>
                </Box>


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
                        columnDefs={columnDefs}
                        rowData={runs}
                        dataTypeDefinitions={dataTypeDefinitions}
                    />
                </div>
                <Space h={'5vh'}/>
            </Container>

        </RoleWrapper>
    );
};

export default Stats;