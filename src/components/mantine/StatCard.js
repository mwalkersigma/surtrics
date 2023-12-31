import {
    IconArrowDownRight,
    IconArrowUpRight,
} from "@tabler/icons-react";
import {Group, Paper, Text} from "@mantine/core";
import classes from "../../styles/StatsGrid.module.css";
import formatter from "../../modules/utils/numberFormatter";
import React from "react";



export default function StatCard ({stat,Icon:i, ...rest}){
    const Icon = i ?? null;
    const DiffIcon = stat?.diff ? stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight : null;
    const YearOverYearDiffIcon = stat?.yoyDiff ? stat.yoyDiff > 0 ? IconArrowUpRight : IconArrowDownRight : null;
    return (
        <Paper {...rest} withBorder p="md" radius="md">
            <Group justify="space-between">
                <Text size="xs" c="dimmed" className={classes.title}>
                    {stat.title}
                </Text>
                {i && <Icon className={classes.icon} size="1.4rem" stroke={1.5} />}
            </Group>

            <Group align="flex-end" gap="xs" mt={25}>
                <Text className={classes.value}>{formatter(stat.value,stat?.format ?? "number")}</Text>
                {DiffIcon &&
                    <Text c={stat.diff > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                        <span>{Math.trunc(stat.diff * 100)/100} {!stat['diffFormat'] && "%"} </span>
                        <DiffIcon size="1rem" stroke={1.5} />
                    </Text>
                }
                {DiffIcon && YearOverYearDiffIcon && <>
                    <Text c={stat.yoyDiff > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                        <span>{Math.trunc(stat.yoyDiff * 100)/100} {!stat['diffFormat'] && "%"} </span>
                        <YearOverYearDiffIcon size="1rem" stroke={1.5} />
                    </Text>
                </>

                }
            </Group>

            <Text fz="xs" c="dimmed" mt={7}>
                {stat.subtitle || ""}
            </Text>
        </Paper>
    )
}