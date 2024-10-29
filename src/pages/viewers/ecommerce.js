import React, {useState} from 'react';
import {
    Center,
    Container,
    Divider,
    Flex,
    Group,
    NumberFormatter,
    Paper,
    Progress,
    RingProgress,
    SimpleGrid,
    Skeleton,
    Space,
    Text,
    Title,
    Tooltip
} from '@mantine/core';
import {
    differenceInCalendarDays,
    lastDayOfMonth,
    setDate,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths
} from "date-fns";
import {IconArrowDownRight, IconArrowUpRight, IconEye} from "@tabler/icons-react";
import {useQuery} from "@tanstack/react-query";
import Order from "../../modules/classes/Order";
import {useDebouncedState} from "@mantine/hooks";
import CustomRangeMenu from "../../components/mantine/customRangeMenu";
import {FaEbay} from "react-icons/fa6";
import {SiBigcommerce, SiQuickbooks} from "react-icons/si";
import {DatePickerInput} from "@mantine/dates";
import findStartOfWeek from "../../modules/utils/findSundayFromDate";
import useUsage from "../../modules/hooks/useUsage";

const customPresets = [
    {
        title: "Today",
        value: [new Date(), new Date()]
    },
    {
        title: "Yesterday",
        value: [subDays(new Date(), 1), subDays(new Date(), 1)]
    },
    {
        title: "This Week",
        value: [findStartOfWeek(new Date()), new Date()]
    },
    {
        title: "Last Week",
        value: [subDays(findStartOfWeek(new Date()), 7), subDays(findStartOfWeek(new Date()), 1)]
    },
    {
        title: "This Month",
        value: [setDate(new Date(), 1), new Date()]
    },
    {
        title: "Last Month",
        value: [startOfMonth(subMonths(new Date(), 1)), lastDayOfMonth(subMonths(new Date(), 1))]
    },
]

function useEcommerceRangeData(config) {
    const startDate = config?.startDate ?? startOfYear(new Date());
    const endDate = config?.endDate;
    const timeScale = config?.timeScale ?? 'day';
    // ebay data
    const {data: ebaySalesData, isPending: ebaySalesPending} = useQuery({
        queryKey: ['ebaySales', startDate, endDate],
        queryFn: async () => {
            if (!startDate && !endDate) {
                return undefined;
            }
            const response = await fetch(`/api/views/ecommerce/ebay/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timeScale=${timeScale}`)
            let data = await response.json();
            return data.map(sale => new Order(sale));
        }
    })
    const {data: ebayTrafficData, isPending: ebayTrafficPending} = useQuery({
        queryKey: ['ebayTraffic', startDate, endDate],
        queryFn: async () => {
            if (!startDate && !endDate) {
                return undefined;
            }
            const response = await fetch(`/api/views/ecommerce/ebay/traffic?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timeScale=${timeScale}`)
            return await response.json();
        }
    })
    // big commerce data
    const {data: bcSalesData, isPending: bcSalesPending} = useQuery({
        queryKey: ['bigCommerceSales', startDate, endDate],
        queryFn: async () => {
            if (!startDate && !endDate) {
                return undefined;
            }
            const response = await fetch(`/api/views/ecommerce/bigCommerce/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timeScale=${timeScale}`)
            let data = await response.json();
            return data.map(sale => new Order(sale));
        }
    })
    const {data: bcTrafficData, isPending: bcTrafficPending} = useQuery({
        queryKey: ['bigCommerceTraffic', startDate, endDate],
        queryFn: async () => {
            if (!startDate && !endDate) {
                return undefined;
            }
            const response = await fetch(`/api/views/ecommerce/bigCommerce/traffic?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timeScale=${timeScale}`)
            return await response.json();
        }
    })
    // quickbooks data
    const {data: qbPurchasingData, isPending: qbPurchasingPending} = useQuery({
        queryKey: ['quickBooks', startDate, endDate],
        queryFn: async () => {
            if (!startDate && !endDate) {
                return undefined;
            }
            const response = await fetch(`/api/views/ecommerce/quickBooks?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timeScale=${timeScale}`)
            return await response.json();
        }
    })
    // listing metrics
    const {data: listingMetricsData, isPending: listingMetricsPending} = useQuery({
        queryKey: ['listingMetrics', startDate, endDate],
        queryFn: async () => {
            if (!startDate && !endDate) {
                return undefined;
            }
            const response = await fetch(`/api/views/increments/range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timeScale=${timeScale}`)
            return await response.json();
        }
    });
    return {
        ebaySalesData,
        ebayTrafficData,
        bcSalesData,
        bcTrafficData,
        qbPurchasingData,
        listingMetricsData,
        ebaySalesPending,
        ebayTrafficPending,
        bcSalesPending,
        bcTrafficPending,
        qbPurchasingPending,
        listingMetricsPending
    }
}


function ProgressCard({stat, timeframe, percent, value, prefix}) {
    if (value === 0) {
        return <Paper>
            <Text>No data found for {timeframe}</Text>
        </Paper>
    }
    return (
        <Paper>
            <Tooltip label={`${stat}'s are ${percent}% of the previous month`} position={'top'}>
                <RingProgress
                    roundCaps
                    thickness={8}
                    label={
                        <Center>
                            <Text c={Number(percent) >= 100 ? "teal" : "red"} fz="sm" fw={700}>
                                {percent}%
                            </Text>
                        </Center>
                    }
                    sections={[
                        {
                            value: percent,
                            color: percent >= 100 ? 'teal' : 'red'
                        }
                    ]}
                />
            </Tooltip>
            <Text fz={'xs'} c={'dimmed'}>
                {timeframe} {stat}: {" "} <br/>
                <Text fz={'lg'} c={'white'}>
                    <NumberFormatter
                        value={value}
                        thousandSeparator
                        prefix={prefix}
                    />
                </Text>
            </Text>
        </Paper>
    )
}

function ComparisonCard({values, isLoading, description, stat, Icon = IconEye, IconSize = '1.5rem', prefix}) {
    const {current, previous, previousYear} = values;
    if (isLoading) {
        return <Skeleton height={300}/>
    }
    if (!current) {
        return <Paper withBorder p={'md'} radius="md" h={'300'}>
            <Group justify="space-between">
                <Text>No Value found</Text>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Center h={'100%'}>
                <Flex direction={'column'} align={'center'}>
                    <Text>Range selection is incomplete</Text>
                </Flex>
            </Center>
        </Paper>
    }
    if (!current?.length) {
        return <Paper withBorder p={'md'} radius="md" h={'300'}>
            <Group justify="space-between">
                <Text>No Value found</Text>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Center h={'100%'}>
                <Flex direction={'column'} align={'center'}>
                    <Text>Data not Found for {stat} in this date range</Text>
                </Flex>
            </Center>
        </Paper>
    }

    const statTotal = Math.trunc(current.reduce((acc, curr) => acc + Number(curr), 0) * 100) / 100;
    const previousStatTotal = Math.trunc(previous.reduce((acc, curr) => acc + Number(curr), 0) * 100) / 100;
    const previousYearStatTotal = Math.trunc(previousYear.reduce((acc, curr) => acc + Number(curr), 0) * 100) / 100;

    const previousPercentageChange = ((statTotal - previousStatTotal) / previousStatTotal) * 100;
    const previousPercentOfTotal = Math.trunc(statTotal / previousStatTotal * 100);
    const previousYearPercentOfTotal = Math.trunc(statTotal / previousYearStatTotal * 100);

    const PreviousIcon = previousPercentageChange > 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
        <Paper withBorder p={'md'} radius="md">
            <Group justify="space-between">
                <Group align="flex-end" gap="xs">
                    <Text order={1} align={'center'} fz={'xl'}>
                        <NumberFormatter
                            value={Number(statTotal)}
                            thousandSeparator
                            prefix={prefix}
                        />
                    </Text>
                    <Text c={Number(previousPercentageChange) > 0 ? "teal" : "red"} fz="sm" fw={700}>
                        <span>{Math.trunc(previousPercentageChange * 100) / 100}%</span>
                        <PreviousIcon size="1rem" stroke={1.5}/>
                    </Text>
                </Group>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Text c="dimmed" fz="sm" mb={'xl'}>
                {description}
            </Text>
            <Group justify={'space-around'}>
                <ProgressCard
                    stat={stat}
                    timeframe={'Previous month'}
                    percent={previousPercentOfTotal}
                    value={previousStatTotal}
                    prefix={prefix}
                />
                <ProgressCard
                    stat={stat}
                    timeframe={'Previous year'}
                    percent={previousYearPercentOfTotal}
                    value={previousYearStatTotal}
                    prefix={prefix}
                />
            </Group>
        </Paper>
    )
}

function SalesCard({values, isLoading, Icon = IconEye, IconSize = '1.5rem'}) {
    const {current, previous, previousYear} = values;
    if (isLoading) {
        return <Skeleton height={300}/>
    }
    if (!current) {
        return <Paper withBorder p={'md'} radius="md" h={'300'}>
            <Group justify="space-between">
                <Text>No Value found</Text>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Center h={'100%'}>
                <Flex direction={'column'} align={'center'}>
                    <Text>Range selection is incomplete</Text>
                </Flex>
            </Center>
        </Paper>
    }
    if (!current?.length) {
        return <Paper withBorder p={'md'} radius="md" h={'300'}>
            <Group justify="space-between">
                <Text>No Value found</Text>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Center h={'100%'}>
                <Flex direction={'column'} align={'center'}>
                    <Text>Data not Found for Sales in this date range</Text>
                    <Text>Or range selection is incomplete</Text>
                </Flex>
            </Center>
        </Paper>
    }

    const ordersTotal = Math.trunc(current.reduce((acc, curr) => acc + Number(curr.total), 0) * 100) / 100;
    const previousOrdersTotal = Math.trunc(previous.reduce((acc, curr) => acc + Number(curr.total), 0) * 100) / 100;
    const previousYearOrdersTotal = Math.trunc(previousYear.reduce((acc, curr) => acc + Number(curr.total), 0) * 100) / 100;

    const previousPercentageChange = ((ordersTotal - previousOrdersTotal) / previousOrdersTotal) * 100;
    const PreviousIcon = previousPercentageChange > 0 ? IconArrowUpRight : IconArrowDownRight;

    const previousPercentOfTotal = Math.trunc(ordersTotal / previousOrdersTotal * 100);
    const previousYearPercentOfTotal = Math.trunc(ordersTotal / previousYearOrdersTotal * 100);

    return (
        <Paper withBorder p={'md'} radius="md">
            <Group justify={'space-between'}>
                <Group align="flex-end" gap="xs">
                    <Text order={1} align={'center'} fz={'xl'}>
                        <NumberFormatter
                            prefix={'$'}
                            value={Number(ordersTotal)}
                            thousandSeparator
                        />
                    </Text>
                    <Text c={Number(ordersTotal - previousOrdersTotal) > 0 ? "teal" : "red"} fz="sm" fw={700}>
                        <span>{Math.round(previousPercentageChange * 100) / 100}%</span>
                        <PreviousIcon size="1rem" stroke={1.5}/>
                    </Text>
                </Group>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Text c="dimmed" fz="sm" mb={'xl'}>
                Sales compared to the previous month
            </Text>
            <Group justify={'space-around'}>
                <ProgressCard
                    stat={"Sales"}
                    timeframe={'Previous month'}
                    percent={previousPercentOfTotal}
                    value={previousOrdersTotal}
                    prefix={'$'}
                />
                <ProgressCard
                    stat={"Sales"}
                    timeframe={'Previous year'}
                    percent={previousYearPercentOfTotal}
                    value={previousYearOrdersTotal}
                    prefix={'$'}
                />
            </Group>
        </Paper>
    )

}

function TransactionsCard({values, isLoading, Icon = IconEye, IconSize = '1.5rem'}) {
    const {current, previous, previousYear} = values;
    if (isLoading) {
        return <Skeleton height={300}/>
    }
    if (!current) {
        return <Paper withBorder p={'md'} radius="md" h={'300'}>
            <Group justify="space-between">
                <Text>No Value found</Text>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Center h={'100%'}>
                <Flex direction={'column'} align={'center'}>
                    <Text>Range selection is incomplete</Text>
                </Flex>
            </Center>
        </Paper>
    }
    if (!current?.length) {
        return <Paper withBorder p={'md'} radius="md" h={'300'}>
            <Group justify="space-between">
                <Text>No Value found</Text>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Center h={'100%'}>
                <Flex direction={'column'} align={'center'}>
                    <Text>Data not Found for Transactions in this date range</Text>
                    <Text>Or range selection is incomplete</Text>
                </Flex>
            </Center>
        </Paper>
    }

    const currentOrderCount = current.length;
    const previousOrderCount = previous.length;
    const previousYearOrderCount = previousYear.length;

    const previousPercentageChange = ((currentOrderCount - previousOrderCount) / currentOrderCount) * 100;
    const PreviousIcon = previousPercentageChange > 0 ? IconArrowUpRight : IconArrowDownRight;

    const previousPercentOfTotal = Math.round(currentOrderCount / previousOrderCount * 100);
    const previousYearPercentOfTotal = Math.round(currentOrderCount / previousYearOrderCount * 100);

    return (
        <Paper withBorder p={'md'} radius="md">
            <Group justify={'space-between'}>
                <Group align="flex-end" gap="xs">
                    <Text order={1} align={'center'} fz={'xl'}>
                        <NumberFormatter
                            value={Number(currentOrderCount)}
                            thousandSeparator
                        />
                    </Text>
                    <Text c={Number(currentOrderCount - previousOrderCount) > 0 ? "teal" : "red"} fz="sm" fw={700}>
                        <span>{Math.trunc(previousPercentageChange * 100) / 100}%</span>
                        <PreviousIcon size="1rem" stroke={1.5}/>
                    </Text>
                </Group>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Text c="dimmed" fz="sm" mb={'xl'}>
                Transactions compared to previous month
            </Text>
            <Group justify={'space-around'}>
                <ProgressCard
                    stat={"Transactions"}
                    timeframe={'Previous month'}
                    percent={previousPercentOfTotal}
                    value={previousOrderCount}
                />
                <ProgressCard
                    stat={"Transactions"}
                    timeframe={'Previous year'}
                    percent={previousYearPercentOfTotal}
                    value={previousYearOrderCount}
                />
            </Group>
        </Paper>
    )
}

function ListingMetricsCard({values, isLoading, Icon = IconEye, IconSize = '1.5rem'}) {
    const {current, previous, previousYear} = values;
    if (isLoading) {
        return <Skeleton height={600}/>
    }
    if (!current || !current?.length) {
        return <Paper withBorder p={'md'} radius="md" h={'300'}>
            <Group justify="space-between">
                <Text>No Value found</Text>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Center h={'100%'}>
                <Flex direction={'column'} align={'center'}>
                    <Text>Range selection is incomplete</Text>
                </Flex>
            </Center>
        </Paper>
    }
    if (current.length === 0) {
        return <Paper withBorder p={'md'} radius="md" h={'300'}>
            <Group justify="space-between">
                <Text>No Value found</Text>
                <Icon size={IconSize} stroke={1}/>
            </Group>
            <Center h={'100%'}>
                <Flex direction={'column'} align={'center'}>
                    <Text>Data not Found for Listing Metrics in this date range</Text>
                    <Text>Or range selection is incomplete</Text>
                </Flex>
            </Center>
        </Paper>
    }

    const totalIncrements = current.reduce((acc, curr) => acc + Number(curr['count']), 0);
    const previousTotalIncrements = previous.reduce((acc, curr) => acc + Number(curr['count']), 0);
    const previousYearTotalIncrements = previousYear.reduce((acc, curr) => acc + Number(curr['count']), 0);

    const previousPercentageChange = ((totalIncrements - previousTotalIncrements) / previousTotalIncrements) * 100;
    const PreviousIcon = previousPercentageChange > 0 ? IconArrowUpRight : IconArrowDownRight;
    // Current
    const addIncrements = current
        .filter(item => item['transaction_reason'] === 'Add')
        .reduce((acc, curr) => acc + Number(curr['count']), 0);
    const addPercentOfTotal = Math.trunc(addIncrements / totalIncrements * 10000) / 100;

    const addOnReceivingIncrements = current
        .filter(item => item['transaction_reason'] === 'Add on Receiving')
        .reduce((acc, curr) => acc + Number(curr['count']), 0)
    const addOnReceivingPercentOfTotal = Math.trunc(addOnReceivingIncrements / totalIncrements * 10000) / 100;

    const relistingIncrements = current
        .filter(item => item['transaction_reason'] === 'Relisting')
        .reduce((acc, curr) => acc + Number(curr['count']), 0);
    const relistingPercentOfTotal = Math.trunc(relistingIncrements / totalIncrements * 10000) / 100;

    // Previous 30 days
    const addIncrementsPrevious = previous
        .filter(item => item['transaction_reason'] === 'Add')
        .reduce((acc, curr) => acc + Number(curr['count']), 0);
    const addPreviousPercentOfTotal = Math.trunc(addIncrementsPrevious / previousTotalIncrements * 10000) / 100;

    const addOnReceivingIncrementsPrevious = previous
        .filter(item => item['transaction_reason'] === 'Add on Receiving')
        .reduce((acc, curr) => acc + Number(curr['count']), 0);
    const addOnReceivingPreviousPercentOfTotal = Math.trunc(addOnReceivingIncrementsPrevious / previousTotalIncrements * 10000) / 100;

    const relistingIncrementsPrevious = previous
        .filter(item => item['transaction_reason'] === 'Relisting')
        .reduce((acc, curr) => acc + Number(curr['count']), 0);
    const relistingPreviousPercentOfTotal = Math.trunc(relistingIncrementsPrevious / previousTotalIncrements * 10000) / 100;

    // previous year
    const addIncrementsPreviousYear = previousYear
        .filter(item => item['transaction_reason'] === 'Add')
        .reduce((acc, curr) => acc + Number(curr['count']), 0);
    const addPreviousYearPercentOfTotal = Math.trunc(addIncrementsPreviousYear / previousYearTotalIncrements * 10000) / 100;

    const addOnReceivingIncrementsPreviousYear = previousYear
        .filter(item => item['transaction_reason'] === 'Add on Receiving')
        .reduce((acc, curr) => acc + Number(curr['count']), 0);
    const addOnReceivingPreviousYearPercentOfTotal = Math.trunc(addOnReceivingIncrementsPreviousYear / previousYearTotalIncrements * 10000) / 100;

    const relistingIncrementsPreviousYear = previousYear
        .filter(item => item['transaction_reason'] === 'Relisting')
        .reduce((acc, curr) => acc + Number(curr['count']), 0);
    const relistingPreviousYearPercentOfTotal = Math.trunc(relistingIncrementsPreviousYear / previousYearTotalIncrements * 10000) / 100;


    return (
        <Paper withBorder p={'md'} radius="md">
            <Group justify="space-between">
                <Group align="flex-end" gap="xs">
                    <Text order={1} align={'center'} fz={'xl'}>
                        <NumberFormatter
                            value={Number(totalIncrements)}
                            thousandSeparator
                        />
                    </Text>
                    <Text c={Number(previousPercentageChange) > 0 ? "teal" : "red"} fz="sm" fw={700}>
                        <span>{Math.round(previousPercentageChange * 100) / 100}%</span>
                        <PreviousIcon size="1rem" stroke={1.5}/>
                    </Text>
                </Group>
                <Icon/>
            </Group>
            <Text c="dimmed" fz="sm" mb={'xl'}>
                Total Increments for the selected range compared to the same range 30 days ago
            </Text>

            <Title order={4} mb={'xs'}>Current</Title>
            <Group mb={'md'} justify={'space-between'}>
                <Text fz={'sm'}>
                    Total Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={totalIncrements} thousandSeparator/>
                        </Text>
                    </Group>
                </Text>
                <Text fz={'sm'}>
                    Add Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={addIncrements} thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{addPercentOfTotal}%</span>
                        </Text>
                    </Group>
                </Text>
                <Text fz={'sm'}>
                    Add On Receiving Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter fz={'lg'} c={'white'} value={addOnReceivingIncrements} thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{addOnReceivingPercentOfTotal}%</span>
                        </Text>
                    </Group>

                </Text>
                <Text fz={'sm'}>
                    Relisting Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={relistingIncrements} thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{relistingPercentOfTotal}%</span>
                        </Text>
                    </Group>
                </Text>

            </Group>
            <Progress.Root mb={'md'} size={34}>
                <Tooltip label={'Add Increments'} position={'top'}>
                    <Progress.Section value={addPercentOfTotal} color={'red'}>
                        {addPercentOfTotal > 15 ?
                            <Progress.Label fz={'md'}>Add : {addPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
                <Tooltip label={'Add On Receiving Increments'} position={'top'}>
                    <Progress.Section value={addOnReceivingPercentOfTotal} color={'green'}>
                        {addOnReceivingPercentOfTotal > 15 ? <Progress.Label fz={'md'}>Add on Receiving
                            : {addOnReceivingPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
                <Tooltip label={'Relisting Increments'} position={'top'}>
                    <Progress.Section value={relistingPercentOfTotal} color={'blue'}>
                        {relistingPercentOfTotal > 15 ?
                            <Progress.Label fz={'md'}>Relisting : {relistingPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
            </Progress.Root>
            <Divider mb={'md'}/>

            <Title order={4} mb={'xs'}>30 days ago</Title>
            <Group mb={'md'} justify={'space-between'}>
                <Text fz={'sm'}>
                    Total Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={previousTotalIncrements} thousandSeparator/>
                        </Text>
                    </Group>
                </Text>
                <Text fz={'sm'}>
                    Add Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={addIncrementsPrevious} thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{addPreviousPercentOfTotal}%</span>
                        </Text>
                    </Group>
                </Text>
                <Text fz={'sm'}>
                    Add On Receiving Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter fz={'lg'} c={'white'} value={addOnReceivingIncrementsPrevious}
                                             thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{addOnReceivingPreviousPercentOfTotal}%</span>
                        </Text>
                    </Group>

                </Text>
                <Text fz={'sm'}>
                    Relisting Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={relistingIncrementsPrevious} thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{relistingPreviousPercentOfTotal}%</span>
                        </Text>
                    </Group>
                </Text>
            </Group>
            <Progress.Root mb={'md'} size={34}>
                <Tooltip label={'Add Increments'} position={'top'}>
                    <Progress.Section value={addPreviousPercentOfTotal} color={'red'}>
                        {addPreviousPercentOfTotal > 15 ?
                            <Progress.Label fz={'md'}>Add : {addPreviousPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
                <Tooltip label={'Add On Receiving Increments'} position={'top'}>
                    <Progress.Section value={addOnReceivingPreviousPercentOfTotal} color={'green'}>
                        {addOnReceivingPreviousPercentOfTotal > 15 ? <Progress.Label fz={'md'}>Add on Receiving
                            : {addOnReceivingPreviousPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
                <Tooltip label={'Relisting Increments'} position={'top'}>
                    <Progress.Section value={relistingPreviousPercentOfTotal} color={'blue'}>
                        {relistingPreviousPercentOfTotal > 15 ?
                            <Progress.Label fz={'md'}>Relisting
                                : {relistingPreviousPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
            </Progress.Root>
            <Divider mb={'md'}/>

            <Title order={4} mb={'xs'}>One Year Ago</Title>
            <Group mb={'md'} justify={'space-between'}>
                <Text fz={'sm'}>
                    Total Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={previousYearTotalIncrements} thousandSeparator/>
                        </Text>
                    </Group>
                </Text>
                <Text fz={'sm'}>
                    Add Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={addIncrementsPreviousYear} thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{addPreviousYearPercentOfTotal}%</span>
                        </Text>
                    </Group>
                </Text>
                <Text fz={'sm'}>
                    Add On Receiving Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter fz={'lg'} c={'white'} value={addOnReceivingIncrementsPreviousYear}
                                             thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{addOnReceivingPreviousYearPercentOfTotal}%</span>
                        </Text>
                    </Group>

                </Text>
                <Text fz={'sm'}>
                    Relisting Increments : <br/>
                    <Group>
                        <Text fz={'lg'} c={'white'}>
                            <NumberFormatter value={relistingIncrementsPreviousYear} thousandSeparator/>
                        </Text>
                        <Text c={'dimmed'} fz="sm" fw={700}>
                            <span>{relistingPreviousYearPercentOfTotal}%</span>
                        </Text>
                    </Group>
                </Text>
            </Group>
            <Progress.Root mb={'md'} size={34}>
                <Tooltip label={'Add Increments'} position={'top'}>
                    <Progress.Section value={addPreviousYearPercentOfTotal} color={'red'}>
                        {addPreviousYearPercentOfTotal > 15 ?
                            <Progress.Label fz={'md'}>Add : {addPreviousYearPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
                <Tooltip label={'Add On Receiving Increments'} position={'top'}>
                    <Progress.Section value={addOnReceivingPreviousYearPercentOfTotal} color={'green'}>
                        {addOnReceivingPreviousYearPercentOfTotal > 15 ? <Progress.Label fz={'md'}>Add on Receiving
                            : {addOnReceivingPreviousYearPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
                <Tooltip label={'Relisting Increments'} position={'top'}>
                    <Progress.Section value={relistingPreviousYearPercentOfTotal} color={'blue'}>
                        {relistingPreviousYearPercentOfTotal > 15 ?
                            <Progress.Label fz={'md'}>Relisting
                                : {relistingPreviousYearPercentOfTotal}%</Progress.Label> : ""}
                    </Progress.Section>
                </Tooltip>
            </Progress.Root>
        </Paper>
    )
}

const EcomDashboard = () => {
    useUsage("Ecommerce", "ecommerce-comparison-dashboard")
    // page state
    const [dateRange, setDateRange] = useState([startOfMonth(new Date()), new Date()])
    const [[startDate, endDate], setValue] = useDebouncedState(dateRange, 500);

    const currentRangeData = useEcommerceRangeData({startDate, endDate});


    const previousMonthRangeData = useEcommerceRangeData({
        startDate: subMonths(startDate, 1),
        endDate: subMonths(endDate, 1)
    });
    const previousYearRangeData = useEcommerceRangeData({
        startDate: subMonths(startDate, 12),
        endDate: subMonths(endDate, 12)
    });

    let daysInRange = differenceInCalendarDays(endDate, startDate);


    return (
        <Container size={'responsive'}>
            <Title mb={'lg'}>
                E-commerce Comparison Dashboard
            </Title>
            {daysInRange > 33 &&
                <Text fz={'xs'} c={'red'}> While you can select time frames larger than a month. The page was designed
                    with intervals less than a month in mind. </Text>}
            {daysInRange < 5 &&
                <Text fz={'xs'} c={'red'}> While you can select time frames shorter than 5 days, not all data is
                    reported in intervals that support this. </Text>}
            <SimpleGrid mb={'lg'} cols={3}>
                <CustomRangeMenu
                    defaultValue={[startDate, endDate]}
                    subscribe={setValue}
                    presets={customPresets}
                    label={'Select Date Range'}
                    mb={'lg'}
                />
                <DatePickerInput
                    label={'30 days ago'}
                    value={[startDate ? subMonths(startDate, 1) : null, endDate ? subMonths(endDate, 1) : null]}
                    disabled
                    type={'range'}
                />
                <DatePickerInput
                    label={'One Year Ago'}
                    value={[startDate ? subMonths(startDate, 12) : null, endDate ? subMonths(endDate, 12) : null]}
                    disabled
                    type={'range'}
                />
            </SimpleGrid>

            <Flex direction={'column'} gap={'md'}>
                <Title order={3} mb={'lg'}>Ebay Metrics</Title>
                <SimpleGrid mb={'lg'} cols={3}>
                    <ComparisonCard
                        isLoading={
                            currentRangeData.ebayTrafficPending ||
                            previousMonthRangeData.ebayTrafficPending ||
                            previousYearRangeData.ebayTrafficPending
                        }
                        values={{
                            current: currentRangeData.ebayTrafficData?.map(data => data.impressions),
                            previous: previousMonthRangeData.ebayTrafficData?.map(data => data.impressions),
                            previousYear: previousYearRangeData.ebayTrafficData?.map(data => data.impressions)
                        }}
                        stat={"Impressions"}
                        Icon={FaEbay}
                        IconSize={'2rem'}
                        description={"Ebay Impressions compared to previous month"}
                    />
                    <ComparisonCard
                        isLoading={
                            currentRangeData.ebayTrafficPending ||
                            previousMonthRangeData.ebayTrafficPending ||
                            previousYearRangeData.ebayTrafficPending
                        }
                        values={{
                            current: currentRangeData.ebayTrafficData?.map(data => data?.['pageviews']),
                            previous: previousMonthRangeData.ebayTrafficData?.map(data => data?.['pageviews']),
                            previousYear: previousYearRangeData.ebayTrafficData?.map(data => data?.['pageviews'])
                        }}
                        stat={"Page Views"}
                        Icon={FaEbay}
                        IconSize={'2rem'}
                        description={"Ebay Page Views compared to previous month"}
                    />
                    <SalesCard
                        isLoading={
                            currentRangeData.ebaySalesPending ||
                            previousMonthRangeData.ebaySalesPending ||
                            previousYearRangeData.ebaySalesPending
                        }
                        values={{
                            current: currentRangeData.ebaySalesData,
                            previous: previousMonthRangeData.ebaySalesData,
                            previousYear: previousYearRangeData.ebaySalesData
                        }}
                        stat={"Sales"}
                        Icon={FaEbay}
                        IconSize={'2rem'}
                        description={"Ebay Sales compared to previous month"}
                    />
                    <TransactionsCard
                        isLoading={
                            currentRangeData.ebaySalesPending ||
                            previousMonthRangeData.ebaySalesPending ||
                            previousYearRangeData.ebaySalesPending
                        }
                        values={{
                            current: currentRangeData.ebaySalesData,
                            previous: previousMonthRangeData.ebaySalesData,
                            previousYear: previousYearRangeData.ebaySalesData
                        }}
                        stat={"Transactions"}
                        Icon={FaEbay}
                        IconSize={'2rem'}
                        description={"Ebay Transactions compared to previous month"}
                    />
                </SimpleGrid>

                <Title order={3} mb={'lg'}>Big Commerce Metrics</Title>
                <SimpleGrid mb={'lg'} cols={3}>
                    <ComparisonCard
                        isLoading={
                            currentRangeData.bcTrafficPending ||
                            previousMonthRangeData.bcTrafficPending ||
                            previousYearRangeData.bcTrafficPending
                        }
                        values={{
                            current: currentRangeData.bcTrafficData?.map(data => data.visits),
                            previous: previousMonthRangeData.bcTrafficData?.map(data => data.visits),
                            previousYear: previousYearRangeData.bcTrafficData?.map(data => data.visits)
                        }}
                        stat={"Visits"}
                        Icon={SiBigcommerce}
                        description={"Big Commerce Visits compared to previous month"}
                    />
                    <ComparisonCard
                        isLoading={
                            currentRangeData.bcTrafficPending ||
                            previousMonthRangeData.bcTrafficPending ||
                            previousYearRangeData.bcTrafficPending
                        }
                        values={{
                            current: currentRangeData.bcTrafficData?.map(data => data.shopped),
                            previous: previousMonthRangeData.bcTrafficData?.map(data => data.shopped),
                            previousYear: previousYearRangeData.bcTrafficData?.map(data => data.shopped)
                        }}
                        stat={"Visits"}
                        Icon={SiBigcommerce}
                        description={"Big Commerce Shopped compared to previous month"}
                    />
                    <ComparisonCard
                        isLoading={
                            currentRangeData.bcTrafficPending ||
                            previousMonthRangeData.bcTrafficPending ||
                            previousYearRangeData.bcTrafficPending
                        }
                        values={{
                            current: currentRangeData.bcTrafficData?.map(data => data.add_to_cart),
                            previous: previousMonthRangeData.bcTrafficData?.map(data => data.add_to_cart),
                            previousYear: previousYearRangeData.bcTrafficData?.map(data => data.add_to_cart)
                        }}
                        stat={"Visits"}
                        Icon={SiBigcommerce}
                        description={"Big Commerce Add To Carts compared to previous month"}
                    />
                    <ComparisonCard
                        isLoading={
                            currentRangeData.bcTrafficPending ||
                            previousMonthRangeData.bcTrafficPending ||
                            previousYearRangeData.bcTrafficPending
                        }
                        values={{
                            current: currentRangeData.bcTrafficData?.map(data => data.web_leads),
                            previous: previousMonthRangeData.bcTrafficData?.map(data => data.web_leads),
                            previousYear: previousYearRangeData.bcTrafficData?.map(data => data.web_leads)
                        }}
                        stat={"Visits"}
                        Icon={SiBigcommerce}
                        description={"Big Commerce Web Leads compared to previous month"}
                    />
                    <SalesCard
                        isLoading={
                            currentRangeData.bcSalesPending ||
                            previousMonthRangeData.bcSalesPending ||
                            previousYearRangeData.bcSalesPending
                        }
                        values={{
                            current: currentRangeData.bcSalesData,
                            previous: previousMonthRangeData.bcSalesData,
                            previousYear: previousYearRangeData.bcSalesData
                        }}
                        stat={"Sales"}
                        Icon={SiBigcommerce}
                    />
                    <TransactionsCard
                        isLoading={
                            currentRangeData.bcSalesPending ||
                            previousMonthRangeData.bcSalesPending ||
                            previousYearRangeData.bcSalesPending
                        }
                        values={{
                            current: currentRangeData.bcSalesData,
                            previous: previousMonthRangeData.bcSalesData,
                            previousYear: previousYearRangeData.bcSalesData
                        }}
                        stat={"Transactions"}
                        Icon={SiBigcommerce}
                    />
                </SimpleGrid>

                <Title order={3} mb={'lg'}>Quick Books Metrics</Title>
                <SimpleGrid mb={'lg'} cols={3}>
                    <ComparisonCard
                        isLoading={
                            currentRangeData.qbPurchasingPending ||
                            previousMonthRangeData.qbPurchasingPending ||
                            previousYearRangeData.qbPurchasingPending
                        }
                        values={{
                            current: currentRangeData.qbPurchasingData?.map(data => data.po_total),
                            previous: previousMonthRangeData.qbPurchasingData?.map(data => data.po_total),
                            previousYear: previousYearRangeData.qbPurchasingData?.map(data => data.po_total)
                        }}
                        description={"Total Dollar amount of Purchase Orders compared to previous month"}
                        stat={"PO Total"}
                        Icon={SiQuickbooks}
                        prefix={'$'}
                    />
                    <ComparisonCard
                        isLoading={
                            currentRangeData.qbPurchasingPending ||
                            previousMonthRangeData.qbPurchasingPending ||
                            previousYearRangeData.qbPurchasingPending
                        }
                        values={{
                            current: currentRangeData.qbPurchasingData?.map(data => data.po_count),
                            previous: previousMonthRangeData.qbPurchasingData?.map(data => data.po_count),
                            previousYear: previousYearRangeData.qbPurchasingData?.map(data => data.po_count)
                        }}
                        description={"Number of Purchase Orders compared to previous month"}
                        stat={"PO Count"}
                        Icon={SiQuickbooks}
                    />
                    <ComparisonCard
                        isLoading={
                            currentRangeData.qbPurchasingPending ||
                            previousMonthRangeData.qbPurchasingPending ||
                            previousYearRangeData.qbPurchasingPending
                        }
                        values={{
                            current: currentRangeData.qbPurchasingData?.map(data => data.po_avg),
                            previous: previousMonthRangeData.qbPurchasingData?.map(data => data.po_avg),
                            previousYear: previousYearRangeData.qbPurchasingData?.map(data => data.po_avg)
                        }}
                        description={"Average PO Dollar amount compared to previous month"}
                        stat={"PO Average"}
                        Icon={SiQuickbooks}
                        prefix={'$'}
                    />

                </SimpleGrid>

                <Title order={3} mb={'lg'}>Listing Metrics</Title>
                <SimpleGrid mb={'lg'} cols={1}>
                    <ListingMetricsCard
                        values={{
                            current: currentRangeData.listingMetricsData,
                            previous: previousMonthRangeData.listingMetricsData,
                            previousYear: previousYearRangeData.listingMetricsData
                        }}
                        isLoading={
                            currentRangeData.listingMetricsPending ||
                            previousMonthRangeData.listingMetricsPending ||
                            previousYearRangeData.listingMetricsPending
                        }
                    />
                </SimpleGrid>
            </Flex>
            <Space h={'10vh'}/>
        </Container>
    );
};

export default EcomDashboard;