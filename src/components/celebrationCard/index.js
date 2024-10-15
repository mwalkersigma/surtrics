import {Flex, Grid, Group, NumberFormatter, Paper, Skeleton, Text, Title, Tooltip} from "@mantine/core";
import formatter from "../../modules/utils/numberFormatter";
import React from "react";

function trunc(value) {
    if (!value) return null;
    return Math.trunc(value * 100) / 100
}

export default function CelebrationCard({metric, loading, id, extraTagLine, showCostSavings}) {
    if (!metric.shown) return null;
    const hasCostSavings = !!metric.timeSavings?.costSavings;
    return (
        <Skeleton visible={!!loading}>
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
                        {!showCostSavings && (
                            <Group mb={'md'} align={'end'}>
                                <Title id={id} c={'teal'}> {formatter(trunc(metric.timeSavings?.raw) ?? '0')} </Title>
                                <Text> {metric.timeSavings?.unit ?? ""} </Text>
                            </Group>
                        )}
                        {hasCostSavings && showCostSavings && (
                            <Group mb={'md'} align={'end'}>
                                <Title id={id} c={'teal'}><NumberFormatter thousandSeparator
                                                                           value={metric.timeSavings.costSavings}
                                                                           decimalScale={2} prefix={'$'}/></Title>
                                <Text> Dollars Saved </Text>
                            </Group>
                        )}
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