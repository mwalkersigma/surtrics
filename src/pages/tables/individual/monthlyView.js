import React, {useState} from 'react';
import useUpdates from "../../../modules/hooks/useUpdates";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {NativeSelect, Table} from "@mantine/core";
import {MonthPickerInput} from "@mantine/dates";
import {setDate} from "date-fns";
import formatter from "../../../modules/utils/numberFormatter";

const dateSet = setDate
const MonthlyView = () => {
    const [user, setUser] = useState("");
    const [date,setDate] = useState(dateSet(new Date(),1))
    let individualData = useUpdates("/api/views/individualView",{date, interval: "1 month"});
    if(typeof individualData === "string") individualData = JSON.parse(individualData);

    let users = Object.keys(individualData);


    return <GraphWithStatCard
        title={"Surplus Transactions Individual Monthly View"}
        isLoading={users.length === 0}
        dateInput={
            <MonthPickerInput
                mb={"xl"}
                label={"Date"}
                value={date}
                onChange={(e) => setDate(e)}
            />
        }
        slotOne={
            <NativeSelect
                mb={"xl"}
                label={"User"}
                value={user}
                onChange={(e) => setUser(e.target.value)}
            >
                <option>Choose a user</option>
                {users.map((user, index) => <option key={index}>{user}</option>)}
            </NativeSelect>
        }
        cards={[]}
    >
        <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing={"sm"}>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Transaction Type</Table.Th>
                    <Table.Th>Transaction Reason</Table.Th>
                    <Table.Th>Count</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {users.length > 0 && users
                    .filter((u) => user === u)
                    .map((row, index) => {
                            let userData = individualData[row];
                            return Object
                                .entries(userData)
                                .map(([key, value]) => {
                                    let [transaction_type, transaction_reason] = key.split(" ");
                                    return (
                                        <Table.Tr key={index + key}>
                                            <Table.Td>{row}</Table.Td>
                                            <Table.Td>{transaction_type}</Table.Td>
                                            <Table.Td>{transaction_reason}</Table.Td>
                                            <Table.Td>{(formatter(+value))}</Table.Td>
                                        </Table.Tr>
                                    )
                                })

                        }
                    )}
            </Table.Tbody>
        </Table>
    </GraphWithStatCard>
};

export default MonthlyView;