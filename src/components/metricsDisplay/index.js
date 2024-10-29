import {useSetState} from "@mantine/hooks";
import useMetricsData from "../../modules/hooks/useMetricsData";
import useLoadObserver from "../../modules/hooks/useLoadObserver";
import {ColorSwatch, Group, NumberFormatter, SimpleGrid, Text} from "@mantine/core";
import {defaultBillableHour, metricListSymbol, palette, totalSavedSymbol} from "../../modules/metrics/consts";
import formatter from "../../modules/utils/numberFormatter";
import SwatchMenu from "../swatchMenu";
import CelebrationCard from "../celebrationCard";
import React from "react";


function trunc(value) {
    if ( !value) return null;
    return Math.trunc(value * 100) / 100
}

export default function MetricsDisplay({metrics, showTimeSavings, totalMetric, totalCardProps, TotalCard}) {
    metrics.populateBadges();
    let allCategories = metrics.allCategories;
    let allSystems = metrics.allSystems;
    let metricList = metrics.metricList;
    let catTotal = metrics.catTotal;
    let systemsTotals = metrics.systemTotals;
    const [shownCategories, setShownCategories] = useSetState(allCategories);
    const [shownSystems, setShownSystems] = useSetState(allSystems);
    const metricsData = useMetricsData(metricList)
    const loadingObserver = useLoadObserver({
        initialValues: metricsData,
        setup: (obs) => [totalMetric, ...metricList].filter(Boolean).forEach(obs.registerMetric)
    });
    metrics.updateShown(shownCategories, shownSystems);
    metrics.updateTotals(shownCategories, shownSystems);
    metrics.updateCostSavings();
    let totalSaved = 0;
    totalSaved = metricList
        .filter(metric => metric.shown)
        .reduce((acc, metric) => acc + metric.timeSavings.raw, 0);
    metricsData.data[totalSavedSymbol] = totalSaved;
    metricsData.data[metricListSymbol] = metricList;
    loadingObserver.updateAllStateAndData(metricsData);
    return (
        <>
            <Group align={'center'} justify={'center'}>
                {Object.keys(allSystems).map((key, i) => {
                        let baseColor = palette?.[key] ?? "grey";
                        let offset = defaultBillableHour;
                        let categoryTotal = catTotal?.[key] ?? 0;
                        let percentTotal = `${categoryTotal === 0 ? 0 : trunc(categoryTotal / Number(totalSaved) * 100)}% of total`
                        let timeSavedLabel = `${formatter(trunc(categoryTotal))} hrs saved ${percentTotal}` ?? "Loading";
                        let costSavedLabel = `${formatter(trunc(categoryTotal * offset), 'currency')} dollars saved ${percentTotal}` ?? "Loading";
                        let label = showTimeSavings ? timeSavedLabel : costSavedLabel;
                        return (
                            <SwatchMenu
                                key={i}
                                label={label}
                                clickHandler={() => setShownCategories({[key]: !shownCategories[key]})}
                                menuItems={Object.keys(shownSystems[key]).map((system, i) => {
                                    let shown = shownSystems[key][system];
                                    let systemSavings = systemsTotals?.[key]?.[system] ?? 0;
                                    let displaySavings = (showTimeSavings) ? systemSavings : systemSavings * offset;
                                    let suffix = (showTimeSavings) ? ' hrs saved' : ' dollars saved';
                                    let prefix = (showTimeSavings) ? '' : '$';
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
            <SimpleGrid mt={'xl'} cols={1}>
                {totalMetric && <CelebrationCard
                    id={'total'}
                    metric={totalMetric}
                    {...totalCardProps}
                />}
                { !totalMetric && TotalCard && <TotalCard {...totalCardProps} />}

            </SimpleGrid>
            <SimpleGrid mb={'xl'} mt={'md'} cols={{base: 1, lg: 2, xl: 3}}>
                {metricList.map((metric, i) => (
                    <CelebrationCard
                        key={i}
                        showCostSavings={ !showTimeSavings}
                        metric={metric}
                    />
                ))}
            </SimpleGrid>
        </>
    )

}