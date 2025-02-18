import React, {useState} from "react";

import useUpdates from "../../../modules/hooks/useUpdates";
import formatDatabaseRows from "../../../modules/utils/formatDatabaseRows";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {Group, NativeSelect, Radio, RadioGroup, Table} from "@mantine/core";
import useUsage from "../../../modules/hooks/useUsage";
import {subDays, subHours} from "date-fns";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";


const formatTimeStamps = (timeStamp) => timeStamp.split("T")[0];

const conversionTable = {
    "Add": ["Add Add", "Add Add on Receiving"],
    "Relisting": ["Add Relisting"],
    "Total": ["Total"]

}

export default function WeeklyView() {
    useUsage("Metrics","quantity-Daily-table")
    const [field, setField] = useState("Total");
    let baseDate = new Date().toDateString();
    baseDate = new Date(baseDate)

    const [[startDate, endDate], setDate] = useState([subHours(subDays(baseDate, 7), 1), baseDate]);
    const [interval, setInterval] = useState("day");
    const databaseRows = useUpdates("/api/views/quantity/weeklyView", {startDate, endDate, interval});

    let rows = formatDatabaseRows(databaseRows);
    let users = Object.keys(rows);


    let dates = [...new Set(users.map(user => Object.keys(rows[user])).flat())].sort()





    return (
        <GraphWithStatCard
            title={"Surplus Quantity Range View"}
            isLoading={databaseRows.length === 0}
            dateInput={
                <CustomRangeMenu
                    subscribe={setDate}
                    defaultValue={[startDate, endDate]}
                    mb={"xl"}
                    label={"Choose Date Range"}
                />
            }
            slotOne={
                <NativeSelect
                    label={'Interval'}
                    value={interval}
                    onChange={(e)=>setInterval(e.target.value)}
                    data={[
                        {label:'Day',value:'day'},
                        {label:'Week',value:'week'},
                        {label:'Month',value:'month'},
                    ]}
                />
            }
            slotTwo={
                <RadioGroup
                    label={"Transaction Type"}
                    value={field}
                    onChange={(e) => setField(e)}
                >
                    <Group>
                        <Radio label={"Total"} value={"Total"} />
                        <Radio label={"Add"} value={"Add"} />
                        <Radio label={"Relisting"} value={"Relisting"}/>
                    </Group>
                </RadioGroup>
            }
            cards={[]}
        >
            <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing={"sm"}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>User</Table.Th>
                        {dates.map((date, index) => <Table.Th key={index}>{formatTimeStamps(date)}</Table.Th>)}
                        <Table.Th>Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {users.map((user, index) => (
                            <Table.Tr key={index}>
                                <Table.Td>{user}</Table.Td>
                                {dates.map((date, index) => {

                                        let dateString = `${date}`
                                        let dateData = rows[user][dateString];
                                        let converter = conversionTable[field];
                                        if (!dateData) return <Table.Td key={index}>0</Table.Td>
                                        if (converter) {
                                            let sum = 0;
                                            for (let i = 0; i < converter.length; i++) {
                                                sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
                                            }
                                            return <Table.Td key={index}>{sum}</Table.Td>
                                        }
                                        return <Table.Td key={index}>0</Table.Td>
                                    }
                                )}
                                <Table.Td className={""}>{Object.values(rows[user]).reduce((acc, curr) => {
                                    let sum = 0;
                                    let converter = conversionTable[field];
                                    for (let i = 0; i < converter.length; i++) {
                                        sum += curr[converter[i]] ? curr[converter[i]] : 0;
                                    }
                                    return acc + sum;
                                }, 0)}</Table.Td>
                            </Table.Tr>
                        )
                    )}
                </Table.Tbody>
                <Table.Tfoot >
                    <Table.Tr>
                        <Table.Th>Daily Total</Table.Th>
                        {dates.map((date, index) => {
                                let dateString = `${date}`
                                let sum = 0;
                                for (let user of users) {
                                    let dateData = rows[user][dateString];
                                    let converter = conversionTable[field];
                                    if (!dateData) continue;
                                    for (let i = 0; i < converter.length; i++) {
                                        sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
                                    }
                                }
                                return <Table.Th key={index}>{sum}</Table.Th>
                            }
                        )}
                        <Table.Th>{
                            users.reduce((acc, curr) => {
                                    let sum = 0;
                                    for (let date in rows[curr]) {
                                        let dateData = rows[curr][date];
                                        let converter = conversionTable[field];
                                        for (let i = 0; i < converter.length; i++) {
                                            sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
                                        }
                                    }
                                    return acc + sum;
                                }
                                , 0)
                        }</Table.Th>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </GraphWithStatCard>

    )
}