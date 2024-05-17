import {IconSearch} from "@tabler/icons-react";
import {Group, LoadingOverlay, NativeSelect, Pagination, rem, ScrollArea, Table, Text, TextInput,} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {toHeaderCase} from "js-convert-case";
import formatter from "../../modules/utils/numberFormatter";
import Th from "./th/th";
import Td from "./td/td";
import sortData, {identifyType} from "../../modules/utils/sortData";


export function TableSort({
                              data,
                              noSearch,
                              loading,
                              footer,
                              noToolTip = [],
                              columnProps = {},
                              specialFormatting = [],
                              noDisplay = [],
                              withPagination,
                              autosize
                          }) {
    const [search, setSearch] = useState('');
    const [sortedData, setSortedData] = useState(data);
    const [sortBy, setSortBy] = useState(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        setSortedData(sortData(data, {sortBy, reversed: reverseSortDirection, search}));
    }, [data, sortBy, reverseSortDirection, search]);

    const setSorting = (field) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setPage(1)
        setSortBy(field);
        setReverseSortDirection(reversed);
        setSortedData(sortData(data, {sortBy: field, reversed, search}));
    };

    const handleSearchChange = (event) => {
        const {value} = event.currentTarget;
        setSearch(value);
        setPage(1)
        setSortedData(sortData(data, {sortBy, reversed: reverseSortDirection, search: value}));
    };

    let headers = data
        .reduce((acc, cur) => {
            for (let key in cur) {
                if (!acc.includes(key) && !noDisplay.includes(key)) {
                    acc.push(key);
                }
            }
            return acc;
        }, []);

    function displayFormatting(value) {
        switch (identifyType(value)) {
            case "number":
                return formatter(value);
            case "date":
                return new Date(value).toLocaleDateString();
            case "boolean":
                return value ? "Yes" : "No";
            case "array":
                return value.join(", ");
            default:
                return value;
        }
    }

    let rows = sortedData
        .map((row, i) => (
            <Table.Tr key={row.id || i}>
                {headers.map((key) => (
                    <Td key={key} ignoreList={["remove", ...noToolTip]} property={key}>
                        {!specialFormatting.map(({column}) => column).includes(key) ?
                            displayFormatting(row[key]) :
                            specialFormatting.find(({column}) => column === key).fn(row[key])
                        }
                    </Td>
                ))}
            </Table.Tr>
        ));

    if (withPagination) {
        rows = rows.slice((page - 1) * pageSize, page * pageSize);
    }

    let Wrapper = ScrollArea;
    let dynamicProps = {};
    if (autosize) {
        Wrapper = ScrollArea.Autosize;
        if (typeof autosize === 'object') {
            dynamicProps = {...{mah: rem(500)}, ...autosize};
        }
        if (typeof autosize === 'string' || typeof autosize === 'number') {
            dynamicProps = {mah: autosize};
        }
    }


    return (
        <Wrapper {...dynamicProps} pos={'relative'}>
            {withPagination && <Group justify={'space-between'}>
                <Pagination
                    my={'xs'}
                    total={Math.floor(sortedData.length / pageSize + 1)}
                    value={page}
                    onChange={setPage}
                />
                <NativeSelect
                    value={pageSize}
                    onChange={(event) => setPageSize(event.currentTarget.value)}
                    style={{width: rem(100)}}
                >
                    {[10, 25, 50, 100, 200].map((key) => (
                        <option key={key} value={key}>
                            {key}
                        </option>
                    ))}
                </NativeSelect>

            </Group>}
            {!noSearch && <TextInput
                placeholder="Search by any field"
                mb="md"
                leftSection={<IconSearch style={{width: rem(16), height: rem(16)}} stroke={1.5}/>}
                value={search}
                onChange={handleSearchChange}
            />}
            <LoadingOverlay visible={loading}/>
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
                            {...columnProps[key] || {}}
                            sorted={sortBy === key}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting(key)}
                        >
                            {toHeaderCase(key)}
                        </Th>))}
                    </Table.Tr>
                </Table.Thead>
                {data.length > 0 && <Table.Tbody>
                    {rows.length > 0 ? (rows) : (<Table.Tr>
                        <Table.Td colSpan={Object.keys(data[0])?.length || 1}>
                            <Text fw={500} ta="center">
                                Nothing found
                            </Text>
                        </Table.Td>
                    </Table.Tr>)}
                </Table.Tbody>}
                {footer && (
                    <Table.Tfoot>
                        {footer}
                    </Table.Tfoot>)
                }
            </Table>
            {withPagination && <Group justify={'space-between'}>
                <Pagination
                    my={'xs'}
                    total={Math.floor(sortedData.length / pageSize + 1)}
                    value={page}
                    onChange={setPage}
                />
                <NativeSelect
                    value={pageSize}
                    onChange={(event) => setPageSize(event.currentTarget.value)}
                    style={{width: rem(100)}}
                >
                    {[10, 25, 50, 100, 200].map((key) => (
                        <option key={key} value={key}>
                            {key}
                        </option>
                    ))}
                </NativeSelect>

            </Group>}
        </Wrapper>
    );
}