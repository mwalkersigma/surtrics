import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconCoin, IconDirections,
    IconDiscount2,
    IconEye,
    IconReceipt2,
    IconUserPlus
} from "@tabler/icons-react";
import {Group, Paper, Text} from "@mantine/core";
import classes from "../../styles/StatsGrid.module.css";
import formatter from "../../modules/utils/numberFormatter";
import React from "react";


const icons = {
    eye: IconEye,
    coin: IconCoin,
    receipt: IconReceipt2,
    user: IconUserPlus,
    discount: IconDiscount2,
    visits: IconDirections,
};

export default function StatsCard ({stat,Icon:i}){
    const Icon = icons[i] || IconEye;
    const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;
    return (
        <Paper withBorder p="md" radius="md" key={stat.title}>
            <Group justify="space-between">
                <Text size="xs" c="dimmed" className={classes.title}>
                    {stat.title}
                </Text>
                <Icon className={classes.icon} size="1.4rem" stroke={1.5} />
            </Group>

            <Group align="flex-end" gap="xs" mt={25}>
                <Text className={classes.value}>{formatter(stat.value,stat?.format ?? "number")}</Text>
                <Text c={stat.diff > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                    <span>{Math.trunc(stat.diff * 100)/100}%</span>
                    <DiffIcon size="1rem" stroke={1.5} />
                </Text>
            </Group>

            <Text fz="xs" c="dimmed" mt={7}>
                {stat.subtitle || ""}
            </Text>
        </Paper>
    )
}