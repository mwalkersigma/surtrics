import {Center, Table, Text, Tooltip} from "@mantine/core";
import React from "react";

export default function Td({property, children, ignoreList = []}) {
    if (ignoreList.includes(property.toString())) {
        return (
            <Table.Td>
                <Center>
                    {children}
                </Center>
            </Table.Td>
        )
    }
    return (
        <Table.Td>
            <Tooltip label={children}>
                <Text truncate={"end"}>
                    {children}
                </Text>
            </Tooltip>
        </Table.Td>
    )
}