import {Badge, Group, NumberFormatter, Paper, Progress, Space, Text, Title} from "@mantine/core";
import formatter from "../../modules/utils/numberFormatter";
import React from "react";

export default function DashboardCard({title, category, value , goal, errors,threshold,badgeText,  hasNav}) {
    let errorRate = (Math.round(errors / value * 100) / 100) * 100;
    return (
        <Paper withBorder p="md" radius="md">
            <Group align={'flex-start'} justify={'space-between'} mb={'xl'}>
                <Text size={hasNav ? "md" : "xl"} c="dimmed">
                    {title}
                </Text>
                <Badge color="teal" variant="light">
                    {category}
                </Badge>
            </Group>
            <Group align={'flex-end'} justify={'space-between'}>
                <Title order={1} style={{fontSize:`${hasNav ? "" : "56px"}`}}>
                    {formatter(value)}
                </Title>
                { errors && errors > 0 && <Text fz="xs" c="dimmed">
                    Error Rate :
                    <NumberFormatter
                        c={errorRate < threshold ? 'teal' : 'red'}
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        value={errorRate}
                        suffix={'%'}
                    />
                </Text>}
            </Group>
            <Space h={'lg'}/>
            <Group justify={'space-between'}>
                <Text size="md" c="dimmed">
                    Progress
                </Text>
                <Text size="md" c="dimmed">
                    <NumberFormatter
                        c={errorRate < threshold ? 'teal' : 'red'}
                        thousandSeparator=","
                        decimalSeparator="."
                        decimalScale={2}
                        value={(value / goal) * 100}
                        suffix={'%'}
                    />
                </Text>
            </Group>
            <Progress size={20} value={(value / goal) * 100} mt={'sm'} mb={'lg'}/>
            <Group justify="space-between" mt="md">
                <Text fz="sm" c="dimmed">
                    {value} / {goal} {category}
                </Text>
                {badgeText}
            </Group>
        </Paper>
    )
};