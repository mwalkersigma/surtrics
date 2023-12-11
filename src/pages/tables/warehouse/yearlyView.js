import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";

import formatDatabaseRows from "../../../modules/utils/formatDatabaseRows";

import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {Table} from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import {setDate, setMonth} from "date-fns";
import useUsage from "../../../modules/hooks/useUsage";
const dateSet = setDate;
const WeeklyView = () => {
    useUsage("Metrics","warehouse-yearly-table")
    const [date, setDate] = useState(setMonth(dateSet(new Date(),1),0));
    const updates = useUpdates("/api/views/picks/warehousePicks",{date ,interval:"1 year",increment:"month"});

    const dates = [...new Set(updates.map(({date})=>date.split("T")[0]))].sort((a,b)=>new Date(a)-new Date(b));
    let rows = formatDatabaseRows(updates);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    months.length = dates.length;
    return (
        <GraphWithStatCard
            title={"Surplus Warehouse Picks Yearly View"}
            isLoading={updates.length === 0}
            dateInput={
                <YearPickerInput
                    label={"Year"}
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
                        {months.map((date) => <Table.Th key={`${date}`}>{date}</Table.Th>)}
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