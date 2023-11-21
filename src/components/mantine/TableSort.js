import {IconChevronDown, IconChevronUp, IconSearch, IconSelector} from "@tabler/icons-react";
import {Center, Group, keys, rem, ScrollArea, Table, Text, TextInput, Tooltip, UnstyledButton} from "@mantine/core";
import classes from "../../styles/TableSort.module.css";
import React, {useEffect, useState} from "react";
import {toHeaderCase} from "js-convert-case";

function Th({children, reversed, sorted, onSort}) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (<Table.Th className={classes.th}>
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
function Td({property,children}) {
    if(property.toLowerCase() === "remove"){
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

function filterData(data, search) {
    const query = search.toLowerCase().trim();
    return data.filter((item) => {
        return keys(data[0]).some((key) => `${item[key]}`.toLowerCase().includes(query))
    });
}

function isNaN(number) {
    return !Number(number)
}

function sorter(a, b) {
    let isNumber = (!isNaN(a) && !isNaN(b));
    if (isNumber) {
        return a - b;
    }
    let isString = (typeof a === "string" && typeof b === "string");
    if (isString) {
        return a.localeCompare(b);
    }
    let isDate = (a instanceof Date && b instanceof Date) || (new Date(a).toString() !== "Invalid Date" && new Date(b).toString() !== "Invalid Date");
    if (isDate) {
        return new Date(a) - new Date(b);
    }
    let isBoolean = (typeof a === "boolean" && typeof b === "boolean");
    if (isBoolean) {
        return a - b;
    }
}

function sortData(data, payload) {
    const {sortBy} = payload;

    if (!sortBy) {
        return filterData(data, payload.search);
    }

    return filterData([...data].sort((a, b) => {
        if (payload.reversed) {
            return sorter(b[sortBy], a[sortBy]);
        }

        return sorter(a[sortBy], b[sortBy]);
    }), payload.search);
}

export function TableSort({data}) {
    const [search, setSearch] = useState('');
    const [sortedData, setSortedData] = useState(data);
    const [sortBy, setSortBy] = useState(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    useEffect(() => {
        setSortedData(sortData(data, {sortBy, reversed: reverseSortDirection, search}));
    }, [data]);

    const setSorting = (field) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(data, {sortBy: field, reversed, search}));
    };

    const handleSearchChange = (event) => {
        const {value} = event.currentTarget;
        setSearch(value);
        setSortedData(sortData(data, {sortBy, reversed: reverseSortDirection, search: value}));
    };

    let headers = data
        .reduce((acc, cur) => {
            for (let key in cur) {
                if (!acc.includes(key)) {
                    acc.push(key);
                }
            }
            return acc;
        }, [])

    const rows = sortedData.map(row => (<Table.Tr key={row.id}>
        {headers.map((key) => (<Td key={key} property={key}> {row[key]}</Td>))}
    </Table.Tr>));


    return (<ScrollArea>
        <TextInput
            placeholder="Search by any field"
            mb="md"
            leftSection={<IconSearch style={{width: rem(16), height: rem(16)}} stroke={1.5}/>}
            value={search}
            onChange={handleSearchChange}
        />
        <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            horizontalSpacing="md"
            verticalSpacing="xs"
            miw={700}
            layout="fixed"
            stickyHeader
        >
            <Table.Thead>
                <Table.Tr bg={"dark"}>
                    {headers.map((key) => (<Th
                        key={key}
                        sorted={sortBy === key}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting(key)}
                    >
                        {toHeaderCase(key)}
                    </Th>))}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {rows.length > 0 ? (rows) : (<Table.Tr>
                    <Table.Td colSpan={Object.keys(data[0])?.length || 1}>
                        <Text fw={500} ta="center">
                            Nothing found
                        </Text>
                    </Table.Td>
                </Table.Tr>)}
            </Table.Tbody>
        </Table>
    </ScrollArea>);
}