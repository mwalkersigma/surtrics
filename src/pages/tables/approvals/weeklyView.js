import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import makeDateArray from "../../../modules/utils/makeDateArray";
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import { Table } from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";
import useUsage from "../../../modules/hooks/useUsage";

const WeeklyView = () => {
    //stat-timeframe-type
    //eg approval-weekly-chart
    useUsage("Metrics","approvals-weekly-chart")
    const [date, setDate] = useState(new Date());
    let updates = useUpdates("/api/views/approvals", {date:findStartOfWeek(new Date(date)),interval:"1 week", increment:"day"});
    let mappedUpdates = {};
    updates?.forEach((update) => {
        let name = update.name;
        let date = update["date_of_final_approval"].split("T")[0];
        if(!mappedUpdates[name]) mappedUpdates[name] = {};
        if(!mappedUpdates[name][date]) mappedUpdates[name][date] = 0;
        mappedUpdates[name][date] += parseInt(update.count);
    })
    let weekArr = makeDateArray(date);

    return (
        <GraphWithStatCard
            title={"Surplus Approvals Weekly View"}
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
                        {weekArr.map((date) => <Table.Th key={`${date}`}>{date}</Table.Th>)}
                        <Table.Th>Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {Object.keys(mappedUpdates).map((name) => {
                        return (
                            <Table.Tr key={name}>
                                <Table.Td>{name}</Table.Td>
                                {weekArr.map((date) => {
                                    return (
                                        <Table.Td key={date}>
                                            {mappedUpdates[name][date] ? mappedUpdates[name][date] : 0}
                                        </Table.Td>
                                    )
                                })}
                                <Table.Td>{Object.values(mappedUpdates[name]).reduce((a,b) => a+b,0)}</Table.Td>
                            </Table.Tr>
                        )}
                    )}
                </Table.Tbody>
                <Table.Tfoot>
                    <Table.Tr>
                        <Table.Th>Total</Table.Th>
                        {weekArr.map((date) => {
                            let total = 0;
                            Object.keys(mappedUpdates).forEach((name) => {
                                if(mappedUpdates[name][date]) total += mappedUpdates[name][date]
                            })
                            return (
                                <Table.Th key={date}>
                                    {total}
                                </Table.Th>
                            )
                        })}
                        <Table.Th>{Object.values(mappedUpdates).reduce((a,b) => {
                            return a + Object.values(b).reduce((c,d) => c+d,0)
                        },0)}</Table.Th>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </GraphWithStatCard>
    )
};

export default WeeklyView;