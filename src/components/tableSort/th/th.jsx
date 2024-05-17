import {IconChevronDown, IconChevronUp, IconSelector} from "@tabler/icons-react";
import {Center, Group, rem, Table, Text, UnstyledButton} from "@mantine/core";
import classes from "../TableSort.module.css";
import React from "react";

export default function Th({children, reversed, sorted, onSort, ...props}) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (<Table.Th {...props} className={classes.th}>
        <UnstyledButton onClick={onSort} className={classes.control}>
            <Group justify="space-between">
                <Text fw={500} fz="sm">
                    {children}
                </Text>
                <Center className={classes.icon}>
                    <Icon style={{width: rem(16), height: rem(16)}} stroke={1.5}/>
                </Center>
            </Group>
        </UnstyledButton>
    </Table.Th>);
}