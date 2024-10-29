import React, {useState} from 'react';
import {Badge, Container, Flex, Grid, rem, Space, Switch, Tabs, Text, Title} from "@mantine/core";
import {IconClock, IconConfetti, IconConfettiOff, IconCurrencyDollar} from "@tabler/icons-react";
import Confetti from "../../components/confetti";
import {useLocalStorage} from "@mantine/hooks";
import timeSavingsMetrics, {total} from "../../modules/metrics/timeSavings";
import revenueGeneratedMetrics, {revenueGenereatedTotal} from "../../modules/metrics/revenueGenerated";
import costAvoidanceMetrics, {costAvoidedTotal} from "../../modules/metrics/costAvoidance";
import dynamic from 'next/dynamic'
import {CostMetrics} from "../../modules/classes/metric";
import {defaultBillableHour, palette, totalSavedSymbol} from "../../modules/metrics/consts";
import MetricsContainer from "../../modules/classes/metricsContainer";

const NoSSRMetricsDisplay = dynamic(() => import('../../components/metricsDisplay'), {ssr: false})

function trunc(value) {
    if ( !value) return null;
    return Math.trunc(value * 100) / 100
}


const grandTotalMetrics = new MetricsContainer(palette);
const grandTotal = new CostMetrics({
    title: "Grand Total Savings",
    id: "total",
    Explanation: `
        This metric is calculated based on all metrics.
        Time savings metrics are the easiest to calculate, we simply take hours saved an multiply it by standard billable hour rate.
        Revenue generated and Cost Avoidance are calculated in reverse, we take the amount of revenue generated or cost avoided and divide it by the standard billable hour rate.
        this gives us an amount of billable hours that product saved for us. Metrics calculated this way will an orange border
    `,
    icon: <Badge>All Systems</Badge>,
    loadingGroup: "anyLoaded",
    valueGetter: (data) => data[totalSavedSymbol],
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        costSavings: null,
        formula(value) {
            this.costSavings = value * defaultBillableHour
            this.raw = Math.trunc(value * 100) / 100
        }
    },
    value: {
        raw: null,
        unit: "Shifts saved ",
        collectionDateStart: "07/01/2023",
        extraTagValue: null,
        extraTagUnit: "Years of work saved.",
        formula(value) {
            let shiftsSaved = trunc(value / 8)
            this.raw = shiftsSaved
            this.extraTagValue = trunc(shiftsSaved / 250)
        }
    }
});
const Celebration = () => {
    const [showTimeSavings, setShowTimeSavings] = useState(true)
    const [confetti, setConfetti] = useLocalStorage({
        key: "confetti", defaultValue: true
    });
    const iconStyle = {width: rem(12), height: rem(12)};

    const groups = [
        {
            "title": "Time Savings",
            "metrics": timeSavingsMetrics,
            hasTimeSavings: true,
            totalMetric: total,
            totalCardProps: {
                showCostSavings: !showTimeSavings,
                extraTagLine: `${trunc(+total?.value?.raw / 250)} Years of work saved.`,
            }
        },
        {
            "title": "Revenue Generated",
            "metrics": revenueGeneratedMetrics,
            totalMetric: revenueGenereatedTotal,
            totalCardProps: {
                showCostSavings: !showTimeSavings,
            }
        },
        {
            "title": "Costs Avoided",
            "metrics": costAvoidanceMetrics,
            totalMetric: costAvoidedTotal,
            totalCardProps: {
                showCostSavings: !showTimeSavings,
            }
        }
    ]

    grandTotalMetrics.metrics = groups
        .map(metric => metric.metrics.metrics)
        .map(metric => Object.entries(metric))
        .flat()
        .reduce((acc, [key, value]) => {
            if ( !acc[key]) acc[key] = [];
            value.forEach(v => {
                acc[key].push(v)
            });
            return acc;
        }, {})

    const displayGroups = [
        {
            title: "All Metrics",
            metrics: grandTotalMetrics,
            totalMetric: grandTotal,
            totalCardProps: {
                showCostSavings: !showTimeSavings,
            }
        },
        ...groups
    ];


    return (
        <Container size={'responsive'}>
            <Grid justify={"flex-start"} mt={'xl'}>
                {confetti && <Confetti/>}
                <Grid.Col span={3}>
                    <Flex direction={'column'} justify={'flex-start'} gap={'.5rem'}>
                        <Switch
                            label={'Show Confetti'}
                            checked={confetti}
                            onChange={() => setConfetti( !confetti)}
                            size={'md'}
                            thumbIcon={confetti ? <IconConfetti
                                style={{width: rem(12), height: rem(12)}}
                                color={'teal'}
                                stroke={2}
                            /> : <IconConfettiOff
                                style={{width: rem(12), height: rem(12)}}
                                color={'gray'}
                                stroke={2}
                            />}
                        />
                        <Switch
                            label={showTimeSavings ? 'Show Cost Savings' : "Show Time Savings"}
                            checked={ !showTimeSavings}
                            onChange={() => setShowTimeSavings( !showTimeSavings)}
                            size={'md'}
                            thumbIcon={showTimeSavings ? <IconClock
                                style={{width: rem(12), height: rem(12)}}
                                color={'teal'}
                                stroke={2}
                            /> : <IconCurrencyDollar
                                style={{width: rem(12), height: rem(12)}}
                                color={'gray'}
                                stroke={2}
                            />}
                        />
                    </Flex>
                </Grid.Col>
                <Grid.Col py={0} span={6}>
                    <Title my={0} py={0} ta={'center'}>
                        🎉 Automation Celebration 🎉
                    </Title>
                    <Text ta={'center'} fz={'xs'} c={'dimmed'}>Metrics that have calculated time savings have <Text span
                                                                                                                    fz={'xs'}
                                                                                                                    c={"#ec8500"}>orange
                        borders</Text></Text>
                </Grid.Col>
                <Grid.Col span={3}></Grid.Col>
            </Grid>
            <Space h={'1rem'}/>
            <Tabs defaultValue={'All Metrics'}>
                <Tabs.List mb={'1rem'}>
                    {displayGroups.map(({title, metrics}, i) => (
                        <Tabs.Tab key={i} value={title} leftSection={<IconClock style={iconStyle}/>}>
                            {title}
                        </Tabs.Tab>
                    ))
                    }
                </Tabs.List>

                {
                    displayGroups.map(({title, metrics, totalMetric, totalCardProps}, i) => (
                        <Tabs.Panel key={i} value={title}>
                            <NoSSRMetricsDisplay
                                totalMetric={totalMetric}
                                showTimeSavings={showTimeSavings}
                                metrics={metrics}
                                totalCardProps={totalCardProps}
                            />
                        </Tabs.Panel>
                    ))
                }
            </Tabs>

        </Container>
    );
};

export default Celebration;