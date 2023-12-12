import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import { Table } from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import { YearPickerInput } from "@mantine/dates";
import {getMonth, setDate, setMonth} from "date-fns";
import formatter from "../../../modules/utils/numberFormatter";
import useUsage from "../../../modules/hooks/useUsage";

const dateSet = setDate

const YearlyView = () => {
    useUsage("Metrics","approvals-yearly-chart")
    const [date,setDate] = useState(dateSet(setMonth(new Date(),0),1))
    let updates = useUpdates("/api/views/approvals", {date,interval:"1 year",increment:"month"});
    let mappedUpdates = {};
    updates.forEach((update) => {
        let name = update.name;
        let date = getMonth(new Date(update["date_of_final_approval"]));
        if(!mappedUpdates[name]) mappedUpdates[name] = {};
        if(!mappedUpdates[name][date]) mappedUpdates[name][date] = 0;
        mappedUpdates[name][date] += parseInt(update.count);
    })
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    return (
        <GraphWithStatCard
            title={"Surplus Approvals Yearly View"}
            isLoading={updates.length === 0}
            dateInput={
                <YearPickerInput
                    mb={"xl"}
                    label={"Date"}
                    value={date}
                    onChange={(e) => setDate(e)}
                />
            }
        >
            <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing={"sm"}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        {months.map((month) => <Table.Th key={`${month}`}>{month}</Table.Th>)}
                        <Table.Th>Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {Object.keys(mappedUpdates).map((name) => {
                        return (
                            <Table.Tr key={name}>
                                <Table.Td>{name}</Table.Td>
                                {months.map((month,index) => {
                                    return (
                                        <Table.Td key={month}>
                                            {formatter(mappedUpdates[name][index] ? mappedUpdates[name][index] : 0)}
                                        </Table.Td>
                                    )
                                })}
                                <Table.Td>{formatter(Object.values(mappedUpdates[name]).reduce((a,b) => a+b,0))}</Table.Td>
                            </Table.Tr>
                        )}
                    )}
                </Table.Tbody>
                <Table.Tfoot>
                    <Table.Tr>
                        <Table.Th>Total</Table.Th>
                        {months.map((month,index) => {
                            let total = 0;
                            Object.keys(mappedUpdates).forEach((name) => {
                                total += mappedUpdates[name][index] ? mappedUpdates[name][index] : 0;
                            })
                            return (
                                <Table.Th key={month}>
                                    {formatter(total)}
                                </Table.Th>
                            )
                        })}
                        <Table.Th>
                            {formatter(Object.values(mappedUpdates).reduce((a,b) => {
                                return Object.values(b).reduce((c,d) => c+d,0) + a;
                            },0))}
                        </Table.Th>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </GraphWithStatCard>
    )
};

export default YearlyView;