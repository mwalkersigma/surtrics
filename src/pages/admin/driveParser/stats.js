import React, {useMemo, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {Box, Center, Container, Group, Loader, Progress, Space, Text, TextInput, Title, Tooltip} from "@mantine/core";
import {IconCircleCheck, IconCircleLetterI, IconCircleX} from "@tabler/icons-react";
import {format, formatDuration, intervalToDuration, isSameDay, subHours} from "date-fns";
import RoleWrapper from "../../../components/RoleWrapper";
import {StatsGroup} from "../../../components/StatsGroup/StatsGroup";
import useUsage from "../../../modules/hooks/useUsage";
import {Carousel} from "@mantine/carousel";
import {colorScheme} from "../../_app";
import DataGrid from "../../../components/agGrid";


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

function serverDateFix(date) {
    if (process.env.NODE_ENV === "development") {
        return subHours(new Date(date), 5)
    }
    return new Date(date)
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

function BreakdownRender({value, fields = [], emptyMessage = 'No Failures'}) {
    let totalValue = fields.map(field => value[field.name]).reduce((acc, curr) => acc + Number(curr), 0);
    return (<Progress.Root size={40}>
        {totalValue !== 0 && fields.map((field, i) => {
            const percentOfTotal = value[field.name] / totalValue * 100;
            return (<Tooltip key={i} label={field.label}>
                <Progress.Section value={percentOfTotal} color={colorScheme.byIndex(i * 4)}>
                    <Progress.Label> {field.label} </Progress.Label>
                </Progress.Section>
            </Tooltip>)
        })}
        {totalValue === 0 && <Progress.Section value={100} color={'gray'}>
            <Progress.Label> {emptyMessage} </Progress.Label>
        </Progress.Section>}
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

function maxDuration(data) {
    return data
        .map(durationToSeconds)
        .reduce((acc, curr) => Math.max(acc, curr), 0);
}

function durationComparator(a, b) {
    let aSeconds = durationToSeconds(a);
    let bSeconds = durationToSeconds(b);
    if (aSeconds === bSeconds) return 0;
    return aSeconds - bSeconds;
}


const Stats = () => {
    useUsage("admin", "drive-parser-health")
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
                {
                    headerName: 'Start Date',
                    field: 'start_date',
                    sortable: true,
                    filter: true,
                    cellRenderer: serverDateRenderer,
                },
                {
                    headerName: 'End Date',
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
            headerName: 'Time Breakdown',
            openByDefault: false,
            children: [
                {
                    headerName: "Total Run Time",
                    field: 'execution_time',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    valueFormatter: (params) => params,
                    comparator: durationComparator,
                },
                {
                    headerName: "Sleeping",
                    field: 'time_sleeping',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    valueFormatter: (params) => params,
                    comparator: durationComparator,
                },
                {
                    headerName: "Waiting for Drive Parser API",
                    field: 'time_waiting_for_drive_parser_api',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    valueFormatter: (params) => params,
                    comparator: durationComparator,
                },
                {
                    headerName: "Time Getting Cost From Sheet",
                    field: 'time_getting_cost_from_sheet',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    valueFormatter: (params) => params,
                    comparator: durationComparator,
                },
                {
                    headerName: "Processing Local Files",
                    field: 'time_processing_local_files',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    valueFormatter: (params) => params,
                    comparator: durationComparator,
                },
            ]
        },
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
        {field: 'completed', cellRenderer: BooleanRenderer, sortable: true, filter: true, width: 150},
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
                    cellRendererParams: {
                        fields: [
                            {name: 'percent_time_processing_local_files', label: 'Processing'},
                            {name: 'percent_time_waiting_for_drive_parser_api', label: 'Drive Parser'},
                            {name: 'percent_time_getting_cost_from_sheet', label: 'Cost Sheet'},
                            {name: 'percent_time_sleeping', label: 'Sleeping'},
                        ]
                    },
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
                    field: 'percent_time_getting_cost_from_sheet',
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
    const lastRunToGeneratePO = runs.filter(run => run['pos_generated'] > 0).sort((a, b) => new Date(b['start_date']) - new Date(a['start_date']))[0];
    let mostRecentRunDate = serverDateFix(new Date(mostRecentRun['start_date']));

    const averageDurationSeconds = Math.trunc(averageDuration(runs.map(run => run['execution_time'])) * 100) / 100 * 1000;
    const averageProcessingTime = Math.trunc(averageDuration(runs.map(run => run['time_processing_local_files'])) * 100) / 100 * 1000;

    function getDurationString(start, end) {
        let startDate = serverDateFix(new Date(start));
        let endDate = serverDateFix(new Date(end));
        if (isSameDay(startDate, endDate)) {
            return formatDuration(intervalToDuration({
                start: serverDateFix(new Date(lastRunToGeneratePO['start_date'])),
                end: new Date()
            }), {format: ['hours', 'minutes']})
        }
        return formatDuration(intervalToDuration({
            start: serverDateFix(new Date(lastRunToGeneratePO['start_date'])),
            end: new Date()
        }), {format: ['days', 'hours']})
    }

    const daysSinceLastPO = lastRunToGeneratePO ? getDurationString(lastRunToGeneratePO['start_date'], new Date()) : null;
    console.log("Days Since Last PO", daysSinceLastPO)
    const bestTimeGettingCost = formatDuration(
        secondsToDuration(
            minDuration(
                runs
                    .map(run => run['time_getting_cost_from_sheet'])
                    .filter(time => durationToSeconds(time) !== 0)
            )
        )
    ).replace("minutes", "min").replace("seconds", "sec");

    const statGroups = [
        // common stats
        [
            {
                title: "Last Run Execution Time",
                stats: formatDuration(mostRecentRun['execution_time']).replace("minutes", "min").replace("seconds", "sec"),
                description: "Time taken to run the most recent run"
            },
            {
                title: "Current File Count",
                stats: mostRecentRun['files_processed'],
                description: "Files processed in the most recent run"
            },
            {
                title: "Time Since Last PO",
                stats: daysSinceLastPO ? daysSinceLastPO : "N/A",
                description: lastRunToGeneratePO ? ` A PO was last generated on ${format(serverDateFix(new Date(lastRunToGeneratePO['start_date'])), "Pp")}` : "No POs generated"
            }
        ],
        // execution time
        [
            {
                title: "Best Execution Time",
                stats: formatDuration(secondsToDuration(minDuration(runs.map(run => run['execution_time'])))).replace("minutes", "min").replace("seconds", "sec"),
                description: "Best time per run"
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
                title: "Worst Execution Time",
                stats: formatDuration(secondsToDuration(maxDuration(runs.map(run => run['execution_time'])))).replace("minutes", "min").replace("seconds", "sec"),
                description: "Best time per run"
            },
        ],
        // file processing
        [
            {
                title: "Current File Total",
                stats: mostRecentRun['total_files'],
                description: "Total files in the most recent run"
            },
            {
                title: "Current Sheet Count",
                stats: mostRecentRun['files_processed'],
                description: "Sheets processed in the most recent run"
            },
            {
                title: "Current Paused Sheet Count",
                stats: mostRecentRun['files_skipped'],
                description: "Sheets skipped due to being in the paused state"
            }
        ],
        // processing time
        [
            {
                title: "Best Processing Time",
                stats: formatDuration(secondsToDuration(minDuration(runs.map(run => run['time_processing_local_files'])))).replace("minutes", "min").replace("seconds", "sec"),
                description: "Time not waiting for Drive Parser API or Sleeping"
            },
            {
                title: "Average Processing Time",
                stats: formatDuration(intervalToDuration({
                    start: 0,
                    end: averageProcessingTime
                })).replace("minutes", "min").replace("seconds", "sec"),
                description: "Time not waiting for Drive Parser API or Sleeping"
            },
            {
                title: "Worst Processing Time",
                stats: formatDuration(secondsToDuration(maxDuration(runs.map(run => run['time_processing_local_files'])))).replace("minutes", "min").replace("seconds", "sec"),
                description: "Time not waiting for Drive Parser API or Sleeping"
            },
        ],
        // runs
        [
            {
                title: "Total Runs",
                stats: runs.length,
                description: "Total runs processed"
            },
            {
                title: "Total POs Generated",
                stats: runs.reduce((acc, run) => acc + run['pos_generated'], 0),
                description: "Total POs generated"
            },
            {
                title: "Time Since Last PO",
                stats: daysSinceLastPO ? daysSinceLastPO : "N/A",
                description: lastRunToGeneratePO ? ` A PO was last generated on ${format(serverDateFix(new Date(lastRunToGeneratePO['start_date'])), "Pp")}` : "No POs generated"
            }
        ],
        // getting costs
        [
            {
                title: "Best Cost Time",
                stats: bestTimeGettingCost,
                description: "Time taken to get cost from sheet"
            },
            {
                title: "Average Cost Time",
                stats: formatDuration(intervalToDuration({
                    start: 0,
                    end: averageDurationSeconds
                })).replace("minutes", "min").replace("seconds", "sec"),
                description: "Time taken to get cost from sheet"
            },
            {
                title: "Worst Cost Time",
                stats: formatDuration(secondsToDuration(maxDuration(runs.map(run => run['time_getting_cost_from_sheet'])))).replace("minutes", "min").replace("seconds", "sec"),
                description: "Time taken to get cost from sheet"
            },
        ],
    ]

    return (
        <RoleWrapper altRoles={['bsa', 'surplus director', 'buying group']}>
            <Container size={'responsive'}>
                <Group>
                    <Title mt={'md'} mb={'xl'}> Drive Parser Health </Title>
                    <Text fz={'sm'} c={'dimmed'}>
                        Most Recent Run: {format(mostRecentRunDate, "Pp")}
                    </Text>
                </Group>
                <Box w={'100%'} mb={'xl'}>
                    <Carousel slideGap="md" loop withIndicators height={200}>
                        {
                            statGroups.map((group, index) => (
                                <Carousel.Slide key={index}>
                                    <StatsGroup data={group}/>
                                </Carousel.Slide>
                            ))
                        }
                    </Carousel>
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
                    <DataGrid
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