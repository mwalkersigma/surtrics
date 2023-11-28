import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";

import formatDatabaseRows from "../../../modules/utils/formatDatabaseRows";

import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {Table} from "@mantine/core";
import {MonthPickerInput} from "@mantine/dates";
import {setDate} from "date-fns";
const dateSet = setDate;
const WeeklyView = () => {
    const [date, setDate] = useState(dateSet(new Date(),1));
    const updates = useUpdates("/api/views/picks/warehousePicks",{date ,interval:"1 month",increment:"week"});

    const dates = [...new Set(updates.map(({date})=>date.split("T")[0]))].sort((a,b)=>new Date(a)-new Date(b));
    let rows = formatDatabaseRows(updates);


    return (
        <GraphWithStatCard
            title={"Surplus Warehouse Picks Monthly View"}
            isLoading={updates.length === 0}
            dateInput={
                <MonthPickerInput
                    label={"Date"}
                    mb={"xl"}
                    value={date}
                    onChange={setDate}
                />
            }
            cards={[]}
        >
            <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing={"sm"}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        {dates.map((date) => <Table.Th key={`${date}`}> week of {date}</Table.Th>)}
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