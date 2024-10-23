import React, {useState} from 'react';
import {
    ColorSwatch,
    Container,
    Flex,
    Grid,
    Group,
    NumberFormatter,
    rem,
    SimpleGrid,
    Space,
    Switch,
    Text,
    Title
} from "@mantine/core";
import {IconClock, IconConfetti, IconConfettiOff, IconCurrencyDollar} from "@tabler/icons-react";
import formatter from "../../modules/utils/numberFormatter";
import Confetti from "../../components/confetti";
import {useLocalStorage, useSetState} from "@mantine/hooks";
import SwatchMenu from "../../components/swatchMenu";
import CelebrationCard from "../../components/celebrationCard";
import useMetricsData from "../../modules/hooks/useMetricsData";
import useLoadObserver from "../../modules/hooks/useLoadObserver";
import metricsContainer, {defaultBillableHour, palette, total} from "../../modules/metrics";


function trunc(value) {
    if (!value) return null;
    return Math.trunc(value * 100) / 100
}


metricsContainer.populateBadges();

let allCategories = metricsContainer.allCategories;
let allSystems = metricsContainer.allSystems;
let metricList = metricsContainer.metricList;

export let totalSavedSymbol = Symbol("totalSaved");
export let metricListSymbol = Symbol("metricList");

const Celebration = () => {
    let catTotal = metricsContainer.catTotal;
    let systemsTotals = metricsContainer.systemTotals;
    const [shownCategories, setShownCategories] = useSetState(allCategories);
    const [shownSystems, setShownSystems] = useSetState(allSystems);
    const [showTimeSavings, setShowTimeSavings] = useState(true)
    const [confetti, setConfetti] = useLocalStorage({
        key: "confetti", defaultValue: true
    });
    const metricsData = useMetricsData(metricList)
    const loadingObserver = useLoadObserver({
        initialValues: metricsData,
        setup: (obs) => [total, ...metricList].forEach(obs.registerMetric)
    });

    metricsContainer.updateShown(shownCategories, shownSystems);
    metricsContainer.updateTotals(shownCategories, shownSystems);
    metricsContainer.updateCostSavings();

    let totalSaved = 0;
    totalSaved = metricList
        .filter(metric => metric.shown)
        .reduce((acc, metric) => acc + metric.timeSavings.raw, 0);


    metricsData.data[totalSavedSymbol] = totalSaved;
    metricsData.data[metricListSymbol] = metricList;
    loadingObserver.updateAllStateAndData(metricsData);

    return (
        <Container size={'responsive'}>
            <Grid justify={"flex-start"} mt={'xl'}>
                <Grid.Col span={3}>
                    <Flex direction={'column'} justify={'flex-start'} gap={'.5rem'}>
                        <Switch
                            label={'Show Confetti'}
                            checked={confetti}
                            onChange={() => setConfetti(!confetti)}
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
                            checked={!showTimeSavings}
                            onChange={() => setShowTimeSavings(!showTimeSavings)}
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
                    <Title
                        my={0}
                        py={0}
                        ta={'center'}
                    >
                        🎉 Automation Celebration 🎉
                    </Title>
                </Grid.Col>
                <Grid.Col span={3}></Grid.Col>
            </Grid>
            <Space h={'2rem'}/>
            <Group align={'center'} justify={'center'}>
                {Object.keys(palette).map((key, i) => {
                        let baseColor = palette[key];
                        let percentTotal = `${catTotal?.[key] === 0 ? 0 : trunc(catTotal?.[key] / Number(totalSaved) * 100)}% of total`
                        let timeSavedLabel = `${formatter(trunc(catTotal?.[key]))} hrs saved ${percentTotal}` ?? "Loading";
                        let costSavedLabel = `${formatter(trunc(catTotal?.[key] * defaultBillableHour), 'currency')} dollars saved ${percentTotal}` ?? "Loading";
                        let label = showTimeSavings ? timeSavedLabel : costSavedLabel;
                        return (
                            <SwatchMenu
                                key={i}
                                label={label}
                                clickHandler={() => setShownCategories({[key]: !shownCategories[key]})}
                                menuItems={Object.keys(shownSystems[key]).map((system, i) => {
                                    let shown = shownSystems[key][system];
                                    let systemSavings = systemsTotals?.[key]?.[system] ?? 0;
                                    let displaySavings = showTimeSavings ? systemSavings : systemSavings * defaultBillableHour;
                                    let suffix = showTimeSavings ? ' hrs saved' : ' dollars saved';
                                    let prefix = showTimeSavings ? '' : '$';
                                    let color = shown ? "green" : "red";
                                    const menuItemClickHandler = () => {
                                        setShownSystems((prev) => ({[key]: {...prev[key], ...{[system]: !shown}}}))
                                    }
                                    return {
                                        itemProps: {
                                            leftSection: <ColorSwatch size={10} color={color}/>,
                                            rightSection: <Text fz={'sm'} c={'dimmed'}>
                                                {
                                                    shown && <>
                                                        <NumberFormatter
                                                            decimalScale={2}
                                                            thousandSeparator
                                                            value={displaySavings}
                                                            prefix={prefix}
                                                            suffix={suffix}
                                                        />
                                                        <Text span fz={'xs'} c={'dimmed'}>
                                                            {" "}
                                                            (
                                                            <NumberFormatter
                                                                decimalScale={2}
                                                                value={systemSavings / catTotal[key] * 100}
                                                                suffix={'%'}
                                                            />
                                                            )
                                                        </Text>
                                                    </>
                                                }
                                            </Text>,
                                            onClick: menuItemClickHandler
                                        },
                                        text: <Text fw={700} tt="capitalize" fz={'md'}>{system}</Text>
                                    }
                                })}
                                color={shownCategories[key] ? baseColor : "grey"}
                                metricKey={key}
                            />
                        )
                    }
                )}
            </Group>
            {confetti && <Confetti/>}
            <SimpleGrid mt={'xl'} cols={1}>
                <CelebrationCard
                    id={'total'}
                    showCostSavings={!showTimeSavings}
                    extraTagLine={`${trunc(+total?.value?.raw / 250)} Years of work saved.`}
                    metric={total}
                />
            </SimpleGrid>
            <SimpleGrid mb={'xl'} mt={'md'} cols={{base: 1, lg: 2, xl: 3}}>
                {metricList.map((metric, i) => (
                    <CelebrationCard
                        key={i}
                        showCostSavings={!showTimeSavings}
                        metric={metric}
                    />
                ))}
            </SimpleGrid>
        </Container>
    );
};

export default Celebration;