import React, {useMemo, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {Box, Center, Container, Group, Loader, Progress, Space, Text, TextInput, Title, Tooltip} from "@mantine/core";
import {IconCircleCheck, IconCircleLetterI, IconCircleX} from "@tabler/icons-react";
import {format, formatDuration, intervalToDuration, isSameDay, subHours} from "date-fns";
import RoleWrapper from "../../../components/RoleWrapper";
import {AgGridReact} from "ag-grid-react";
import {StatsGroup} from "../../../components/StatsGroup/StatsGroup";
import useUsage from "../../../modules/hooks/useUsage";
import {Carousel} from "@mantine/carousel";
import {colorScheme} from "../../_app";


function DurationRenderer({value}) {
    return <Center
        h={'100%'}>{formatDuration(value, {format: ["seconds"]}).replace("seconds", "sec")} {value.milliseconds} ms </Center>;
}

function trunc(value) {
    if (!value) return null;
    return Math.trunc(value * 100) / 100
}

function BooleanRenderer({value}) {
    return <Center h={'100%'}>{value ? <IconCircleCheck color={'var(--mantine-color-green-5)'}/> :
        <IconCircleX color={'var(--mantine-color-red-5)'}/>}</Center>;
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
    let totalValue = fields.map(field => value[field.name]).reduce((acc, curr) => acc + curr, 0);
    return (<Progress.Root size={40}>
        {totalValue !== 0 && fields.map((field, i) => {
            const percentOfTotal = value[field.name] / totalValue * 100;
            return (<Tooltip label={field.label}>
                <Progress.Section value={percentOfTotal} color={colorScheme.byIndex(i)}>
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

function durationToMilliseconds(duration) {
    return durationToSeconds(duration) * 1000 + (duration?.milliseconds ?? 0);
}

function secondsToDuration(seconds) {
    return {
        hours: Math.floor(seconds / 3600),
        minutes: Math.floor(seconds / 60) % 60,
        seconds: Math.floor(seconds * 100) / 100 % 60
    }
}

function millisecondsToDurationString(m) {
    if (m === 0) return "0 sec";
    let secondsValue = trunc(m / 1000);
    if (secondsValue < 60) return secondsValue + " sec";
    let minutesValue = Math.trunc(secondsValue / 60);
    if (minutesValue < 60) return minutesValue + " min " + trunc(secondsValue % 60) + " sec";
    let hoursValue = Math.trunc(minutesValue / 60);
    if (hoursValue < 24) return hoursValue + " hr " + trunc(minutesValue % 60) + " min " + trunc(secondsValue % 60) + " sec";
    let daysValue = Math.trunc(hoursValue / 24);
    if (daysValue < 7) return daysValue + " days " + trunc(hoursValue % 24) + " hr " + trunc(minutesValue % 60) + " min " + trunc(secondsValue % 60) + " sec";
    let weeksValue = Math.trunc(daysValue / 7);
    if (weeksValue < 4) return weeksValue + " weeks " + trunc(daysValue % 7) + " days " + trunc(hoursValue % 24) + " hr " + trunc(minutesValue % 60) + " min " + trunc(secondsValue % 60) + " sec";
    let monthsValue = Math.trunc(weeksValue / 4);
    if (monthsValue < 12) return monthsValue + " months " + trunc(weeksValue % 4) + " weeks " + trunc(daysValue % 7) + " days " + trunc(hoursValue % 24) + " hr " + trunc(minutesValue % 60) + " min " + trunc(secondsValue % 60) + " sec";
    let yearsValue = Math.trunc(monthsValue / 12);
    return yearsValue + " years " + Math.trunc(monthsValue % 12) + " months " + trunc(weeksValue % 4) + " weeks " + trunc(daysValue % 7) + " days " + trunc(hoursValue % 24) + " hr " + trunc(minutesValue % 60) + " min " + trunc(secondsValue % 60) + " sec";
}

function averageDuration(data) {
    // duration = {hours: 0, minutes: 0, seconds: 0}
    return data
        .map(durationToMilliseconds)
        .reduce((acc, curr) => acc + curr, 0) / data.length;
}

function minDuration(data) {
    return data
        .map(durationToMilliseconds)
        .reduce((acc, curr) => Math.min(acc, curr), Infinity);
}

function maxDuration(data) {
    return data
        .map(durationToMilliseconds)
        .reduce((acc, curr) => Math.max(acc, curr), 0);
}

function durationComparator(a, b) {
    let aSeconds = durationToMilliseconds(a);
    let bSeconds = durationToMilliseconds(b);
    if (aSeconds === bSeconds) return 0;
    return aSeconds - bSeconds;
}


const Stats = () => {
    useUsage("admin", "sheet-maker-health")
    const [searchText, setSearchText] = useState('');
    const {data: runs, isPending} = useQuery({
        queryKey: ["runs"],
        queryFn: async () => {
            console.log("Updating")
            const response = await fetch("/api/views/pricingSheets/runs");
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
                    headerName: 'Get Opps Start',
                    field: 'get_opps_start',
                    sortable: true,
                    filter: true,
                    cellRenderer: serverDateRenderer,
                    columnGroupShow: 'open'
                },
                {
                    headerName: 'Get Opps End',
                    field: 'get_opps_end',
                    sortable: true,
                    filter: true,
                    cellRenderer: serverDateRenderer,
                    columnGroupShow: 'open'
                },
                {
                    headerName: 'Process Opps Start',
                    field: 'process_opps_start',
                    sortable: true,
                    filter: true,
                    cellRenderer: serverDateRenderer,
                    columnGroupShow: 'open'
                },
                {
                    headerName: 'Process Opps End',
                    field: 'process_opps_end',
                    sortable: true,
                    filter: true,
                    cellRenderer: serverDateRenderer,
                    columnGroupShow: 'open'
                }
            ]
        },
        {
            headerName: 'Time Breakdown',
            openByDefault: false,
            children: [
                {
                    headerName: "Total Run Time",
                    field: 'total_execution_time',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    valueFormatter: (params) => params,
                    comparator: durationComparator,
                },
                {
                    headerName: "Time Getting Opps",
                    field: 'total_time_getting_opps',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    valueFormatter: (params) => params,
                    comparator: durationComparator,
                    columnGroupShow: 'open'
                },
                {
                    headerName: "Time Processing Opps",
                    field: 'total_time_processing_opps',
                    cellRenderer: DurationRenderer,
                    sortable: true,
                    filter: true,
                    valueFormatter: (params) => params,
                    comparator: durationComparator,
                    columnGroupShow: 'open'
                }
            ]
        },
        {
            headerName: 'Folders generated',
            field: 'folders_generated',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Folders Sent To Insightly',
            field: 'folder_urls_sent_to_insightly',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Opp Processing',
            openByDefault: false,
            children: [
                {
                    headerName: "Breakdown",
                    columnGroupShow: 'closed',
                    cellRenderer: BreakdownRender,
                    cellRendererParams: {
                        fields: [
                            {name: 'opps_failed_no_doc_number', label: 'No Document Sequence Number'},
                            {name: 'opps_failed_not_parts', label: 'Not a parts Opp'},
                            {name: 'opps_processed', label: 'Processed Opps'},
                        ],
                        emptyMessage: 'No Opps Processed'
                    },
                    valueGetter: (params) => params.data,
                    width: 500
                },
                {
                    headerName: "Total Opps",
                    field: 'opps_in_run',
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open'
                },
                {
                    headerName: "All New Opps Attempted",
                    field: 'all_new_opps_attempted',
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open',
                    cellRenderer: BooleanRenderer,
                },
                {
                    headerName: 'Opps Attempted',
                    field: 'opps_attempted',
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open'
                },
                {
                    headerName: 'Opps Processed',
                    field: 'opps_processed',
                    sortable: true,
                    filter: true,
                    columnGroupShow: 'open'
                },
                {
                    headerName: 'Opps Failed',
                    openByDefault: false,
                    columnGroupShow: 'open',
                    children: [
                        {
                            headerName: "Breakdown",
                            columnGroupShow: 'closed',
                            cellRenderer: BreakdownRender,
                            cellRendererParams: {
                                fields: [
                                    {name: 'opps_failed_no_doc_number', label: 'No Document Sequence Number'},
                                    {name: 'opps_failed_not_parts', label: 'Not a parts Opp'},
                                ]
                            },
                            valueGetter: (params) => params.data,
                            width: 500
                        },
                        {
                            headerName: 'No Document Sequence',
                            field: 'opps_failed_no_doc_number',
                            sortable: true,
                            filter: true,
                            columnGroupShow: 'open'
                        },
                        {
                            headerName: 'Not a parts Opp',
                            field: 'opps_failed_not_parts',
                            sortable: true,
                            filter: true,
                            columnGroupShow: 'open'
                        },
                        {
                            headerName: 'No Name',
                            field: 'opps_failed_no_name',
                            sortable: true,
                            filter: true,
                            columnGroupShow: 'open'
                        }
                    ]
                }
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
    const lastRunToGenerateFolder = runs.filter(run => run['folders_generated'] > 0).sort((a, b) => new Date(b['start_date']) - new Date(a['start_date']))[0];
    let mostRecentRunDate = serverDateFix(new Date(mostRecentRun['start_date']));

    const lastRunExecutionTime = mostRecentRun['total_execution_time'];
    const lastRunGettingOpps = mostRecentRun['total_time_getting_opps'];
    const lastRunProcessingOpps = mostRecentRun['total_time_processing_opps'];


    const averageExecutionTime = Math.trunc(averageDuration(runs.map(run => run['total_execution_time'])) * 100) / 100;
    const averageTimeGettingOpps = Math.trunc(averageDuration(runs.map(run => run['total_time_getting_opps'])) * 100) / 100;
    const averageTimeProcessingOpps = Math.trunc(averageDuration(runs.map(run => run['total_time_processing_opps'])) * 100) / 100;


    const minExecutionTime = minDuration(runs.map(run => run['total_execution_time']));
    const minTimeGettingOpps = minDuration(runs.map(run => run['total_time_getting_opps']));
    const minTimeProcessingOpps = minDuration(runs.map(run => run['total_time_processing_opps']));


    const maxExecutionTime = maxDuration(runs.map(run => run['total_execution_time']));
    const maxTimeGettingOpps = maxDuration(runs.map(run => run['total_time_getting_opps']));
    const maxTimeProcessingOpps = maxDuration(runs.map(run => run['total_time_processing_opps']));


    function getDurationString(start, end) {
        let startDate = serverDateFix(new Date(start));
        let endDate = serverDateFix(new Date(end));
        if (isSameDay(startDate, endDate)) {
            return formatDuration(intervalToDuration({
                start: serverDateFix(new Date(lastRunToGenerateFolder['start_date'])),
                end: new Date()
            }), {format: ['hours', 'minutes']})
        }
        return formatDuration(intervalToDuration({
            start: serverDateFix(new Date(lastRunToGenerateFolder['start_date'])),
            end: new Date()
        }), {format: ['days', 'hours']})
    }

    const daysSinceLastFolder = lastRunToGenerateFolder ? getDurationString(lastRunToGenerateFolder['start_date'], new Date()) : null;


    const statGroups = [
        // Last Run Details
        [
            {
                title: "Last Run Execution Time",
                stats: millisecondsToDurationString(durationToMilliseconds(lastRunExecutionTime)),
                description: "Time taken for the most recent run"
            },
            {
                title: "Last runs opps processed",
                stats: mostRecentRun['opps_in_run'],
                description: "Opps returned by insightly in the most recent run"
            },
            {
                title: "Time Since Last Folder",
                stats: daysSinceLastFolder ? daysSinceLastFolder : "N/A",
                description: lastRunToGenerateFolder ? ` A folder was last generated on ${format(serverDateFix(new Date(lastRunToGenerateFolder['start_date'])), "Pp")}` : "No folders generated"
            }
        ],
        // Averages
        [
            {
                title: "Average Execution Time",
                stats: millisecondsToDurationString(averageExecutionTime),
                description: "Average Time for script to run"
            },
            {
                title: "Average Time Getting Opps",
                stats: millisecondsToDurationString(averageTimeGettingOpps),
                description: "Average Time for script to get opps"
            },
            {
                title: "Average Time Processing Opps",
                stats: millisecondsToDurationString(averageTimeProcessingOpps),
                description: "Average Time for script to process opps"
            }
        ],
        // Execution Time
        [
            {
                title: "Best Execution Time",
                stats: millisecondsToDurationString(minExecutionTime),
                description: "Best time for script to run"
            },
            {
                title: "Average Execution Time",
                stats: millisecondsToDurationString(averageExecutionTime),
                description: "Average Time for script to run"
            },
            {
                title: "Worst Execution Time",
                stats: millisecondsToDurationString(maxExecutionTime),
                description: "Worst time for script to run"
            }
        ],
        // Getting Opps
        [
            {
                title: "Best Time Getting Opps",
                stats: millisecondsToDurationString(minTimeGettingOpps),
                description: "Best time for script to get opps"
            },
            {
                title: "Average Time Getting Opps",
                stats: millisecondsToDurationString(averageTimeGettingOpps),
                description: "Average Time for script to get opps"
            },
            {
                title: "Worst Time Getting Opps",
                stats: millisecondsToDurationString(maxTimeGettingOpps),
                description: "Worst time for script to get opps"
            }

        ],
        // Processing Opps
        [
            {
                title: "Best Time Processing Opps",
                stats: millisecondsToDurationString(minTimeProcessingOpps),
                description: "Best time for script to process opps"
            },
            {
                title: "Average Time Processing Opps",
                stats: millisecondsToDurationString(averageTimeProcessingOpps),
                description: "Average Time for script to process opps"
            },
            {
                title: "Worst Time Processing Opps",
                stats: millisecondsToDurationString(maxTimeProcessingOpps),
                description: "Worst time for script to process opps"
            }
        ],
        // Total Stats
        [
            {
                title: "Total Runs",
                stats: runs.length,
                description: "Total runs processed"
            },
            {
                title: "Total Folders Generated",
                stats: runs.reduce((acc, run) => acc + run['folders_generated'], 0),
                description: "Total Folders generated"
            },
            {
                title: "Time Since Last PO",
                stats: daysSinceLastFolder ? daysSinceLastFolder : "N/A",
                description: lastRunToGenerateFolder ? ` A folder was last generated on ${format(serverDateFix(new Date(lastRunToGenerateFolder['start_date'])), "Pp")}` : "No folders generated"
            }
        ]
    ];


    return (
        <RoleWrapper altRoles={['bsa', 'surplus director', 'buying group']}>
            <Container size={'responsive'}>
                <Group>
                    <Title mt={'md'} mb={'xl'}> Sheet Creation Health </Title>
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
                    <AgGridReact
                        pagination={true}
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