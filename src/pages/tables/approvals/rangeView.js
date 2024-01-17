import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import findStartOfWeek from "../../../modules/utils/findSundayFromDate";
import {NativeSelect, Table} from "@mantine/core";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import useUsage from "../../../modules/hooks/useUsage";
import {addDays} from "date-fns";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";

const RangeView = () => {
    //stat-timeframe-type
    //eg approval-weekly-chart
    useUsage("Metrics","approvals-range-chart");
    const [increment,setIncrement] = useState("day")
    const [[startDate,endDate],setDate] = useState([findStartOfWeek(new Date()),addDays(findStartOfWeek(new Date()), 7)])
    let updates = useUpdates("/api/views/approvals", {
            startDate,
            endDate,
            increment
        }
    );

    let mappedUpdates = {};
    updates?.forEach((update) => {
        let name = update.name;
        let date = update["date_of_final_approval"].split("T")[0];
        if(!mappedUpdates[name]) mappedUpdates[name] = {};
        if(!mappedUpdates[name][date]) mappedUpdates[name][date] = 0;
        mappedUpdates[name][date] += parseInt(update.count);
    })
    let dateArray = updates
        .map((update) => update["date_of_final_approval"].split("T")[0])
        .reduce((a,b) => a.includes(b) ? a : [...a,b],[])
        .sort((a,b) => new Date(a) - new Date(b))


    return (
        <GraphWithStatCard
            title={"Surplus Approvals Range View"}
            isLoading={updates.length === 0}
            dateInput={
                <CustomRangeMenu
                    subscribe={setDate}
                    defaultValue={[startDate,endDate]}
                    label={"Date"}
                    mb={"xl"}
                />
            }
            slotOne={
                <NativeSelect
                    value={increment}
                    onChange={(e) => setIncrement(e.currentTarget.value)}
                    data={[
                        //{value:"hour",label:"Hour"},
                        {value:"day",label:"Day"},
                        {value:"week",label:"Week"},
                        {value:"month",label:"Month"},
                        {value:"year",label:"Year"},
                    ]}
                    label={"Increment"}
                    mb={"xl"}
                />
            }
            cards={[]}
            >
            <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing={"sm"}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        {dateArray.map((date) => <Table.Th key={`${date}`}>{date}</Table.Th>)}
                        <Table.Th>Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {Object.keys(mappedUpdates).map((name) => {
                        return (
                            <Table.Tr key={name}>
                                <Table.Td>{name}</Table.Td>
                                {dateArray.map((date) => {
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
                        {dateArray.map((date) => {
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

export default RangeView;