import {Flex, Grid, Group, NumberFormatter, Paper, Skeleton, Text, Title, Tooltip} from "@mantine/core";
import React from "react";


export default function CelebrationCard({metric, loading, id, extraTagLine, showCostSavings}) {
    if (!metric.shown) return null;
    let isLoading = loading || !metric.isRendered;
    const hasCostSavings = !!metric.timeSavings?.costSavings;
    let isShowingCost = (hasCostSavings && showCostSavings);
    let displayValue = isShowingCost ? metric.timeSavings?.costSavings : metric.timeSavings?.raw ?? 0;
    let displayUnit = isShowingCost ? "Dollars Saved" : metric.timeSavings?.unit ?? "";
    let displayPrefix = isShowingCost ? "$" : "";

    return (
        <Skeleton visible={!!isLoading}>
            <Paper p={"1rem 1.5rem"} withBorder>
                <Grid justify="space-between">
                    <Grid.Col span={8}>
                        <Tooltip label={metric?.title ?? ""}>
                            <Text truncate="end"> {metric.title} </Text>
                        </Tooltip>
                    </Grid.Col>
                    <Grid.Col justify={'flex-end'} span={4}>
                        <Flex justify={'flex-end'}>
                            {metric.icon}
                        </Flex>
                    </Grid.Col>
                </Grid>
                <Tooltip
                    multiline
                    withArrow
                    label={metric.Explanation}
                    w={220}
                    transitionProps={{
                        duration: 200
                    }}
                >
                    <Flex justify={'space-between'}>
                        <Group mb={'md'} align={'end'}>
                            <Title id={id} c={'teal'}>
                                <NumberFormatter
                                    thousandSeparator
                                    value={displayValue}
                                    decimalScale={2}
                                    prefix={displayPrefix}
                                />
                            </Title>
                            <Text> {displayUnit} </Text>
                        </Group>
                        <Group></Group>
                    </Flex>
                </Tooltip>
                <Group c={'dimmed'} justify={'space-between'}>
                    <Group>
                        <Text fz={'xs'}> {metric.value.raw} {metric.value?.unit ?? ""}  </Text>
                        {extraTagLine && <Text fz={'xs'}> {extraTagLine} </Text>}
                    </Group>
                    <Text fz={'xs'}> Start Date {metric.value?.collectionDateStart ?? ""} </Text>
                </Group>

            </Paper>
        </Skeleton>
    )
}