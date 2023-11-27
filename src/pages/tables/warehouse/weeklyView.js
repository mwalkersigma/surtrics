import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";

import makeDateArray from "../../../modules/utils/makeDateArray";
import formatDatabaseRows from "../../../modules/utils/formatDatabaseRows";

import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {Table} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";

const WeeklyView = () => {
    const [date, setDate] = useState(new Date());
    const updates = useUpdates("/api/views/picks/warehousePicks",{date});
    const dates = makeDateArray(date);
    let rows = formatDatabaseRows(updates);

    return (
        <GraphWithStatCard
            title={"Surplus Warehouse Picks Weekly View"}
            isLoading={updates.length === 0}
            dateInput={
                <DatePickerInput
                    mb={"xl"}
                    label={"Date"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
            cards={[]}
        >
            <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing={"sm"}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        {dates.map((date) => <Table.Th key={`${date}`}>{date}</Table.Th>)}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {Object.keys(rows).map((name) => {
                        return (
                            <Table.Tr key={name}>
                                <Table.Td>{name}</Table.Td>
                                {dates.map((rowDate) => {
                                    return (
                                        <Table.Td key={`${name}-${rowDate}`}>
                                            {rows[name][rowDate]?.Total ?? 0}
                                        </Table.Td>
                                    )
                                })}
                            </Table.Tr>
                        )}
                    )}
                </Table.Tbody>
            </Table>
        </GraphWithStatCard>

    )
};

export default WeeklyView;