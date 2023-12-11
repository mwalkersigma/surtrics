import React, {useState} from 'react';
import {subMonths} from "date-fns";

import {NativeSelect, Table} from "@mantine/core";
import useUpdates from "../../../modules/hooks/useUpdates";
import RoleWrapper from "../../../components/RoleWrapper";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUsage from "../../../modules/hooks/useUsage";


const ErrorsByUser = () => {
    useUsage("Admin","Errors-RangeView-table")
    const [dateRange, setDateRange] = useState([subMonths(new Date(),1), new Date()]);
    const [startDate, endDate] = dateRange;
    const errors = useUpdates("/api/views/errors",{startDate, endDate});

    const [user, setUser] = useState(null)

    const users = ["----Select User------",...new Set(errors.map(({user}) => user))];

    const dataOrderedByUser = users.reduce((acc,user)=>{
        const userErrors = errors.filter((error)=>error.user === user);
        const userErrorsByDate = userErrors.reduce((acc,error)=>{
            const date = new Date(error.transaction_date).toLocaleDateString();
            if(!acc[date]){
                acc[date] = {};
            }
            acc[date][error.transaction_reason] = acc[date][error.transaction_reason] ? acc[date][error.transaction_reason] + 1 : 1;
            // acc[date]["Total"] = acc[date]["Total"] ? acc[date]["Total"] + 1 : 1;
            return acc;
        },{});
        acc[user] = userErrorsByDate;
        return acc;
    },{})

    const userErrors = dataOrderedByUser[user] ?? {};
    const errorReasons = userErrors ? Object.keys(userErrors).reduce((acc,date)=>{
        const reasons = Object.keys(userErrors[date]);
        reasons.forEach((reason)=>{
            if(!acc.includes(reason)){
                acc.push(reason);
            }
        })
        return acc;
    },[]) : [];

    let dates = Object.keys(userErrors).sort((a,b)=>new Date(a) - new Date(b));


    return (
        <RoleWrapper altRoles={["surplus director","warehouse"]}>
            <GraphWithStatCard
                title="User Error Range View"
                noBorder
                dateInput={
                    <CustomRangeMenu
                        defaultValue={dateRange}
                        subscribe={setDateRange}
                        mb={'xl'}
                    />
                }
                slotOne={
                    <NativeSelect
                        data={users.map((user)=>({value:user,label:user}))}
                        onChange={(event)=>setUser(event.currentTarget.value)}
                        value={user}
                    />
                }
            >
                {userErrors && <Table.ScrollContainer minWidth={500}>
                    <Table
                        striped
                        highlightOnHover
                        withTableBorder
                        withColumnBorders
                        miw={700}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Reason</Table.Th>
                                {dates.map((date, index) => (
                                    <Table.Th key={index}>{date}</Table.Th>
                                ))}
                                <Table.Th>Total</Table.Th>
                            </Table.Tr>

                        </Table.Thead>

                        <Table.Tbody>
                            {errorReasons.map((reason, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>{reason}</Table.Td>
                                    {dates.map((date, index) => (
                                        <Table.Td key={index}>{userErrors[date][reason] || 0}</Table.Td>
                                    ))}
                                    <Table.Td>{dates.reduce((acc,date)=>acc + (userErrors[date][reason] || 0),0)}</Table.Td>
                                </Table.Tr>
                            ))}

                        </Table.Tbody>
                        <Table.Tfoot>
                            <Table.Tr>
                                <Table.Th>Total</Table.Th>
                                {dates.map((date, index) => (
                                    <Table.Th key={index}>{Object.values(userErrors[date]).reduce((acc,reason)=>acc + reason,0)}</Table.Th>
                                ))}
                                <Table.Th>{Object.values(userErrors).reduce((acc,date)=>acc + Object.values(date).reduce((acc,reason)=>acc + reason,0),0)}</Table.Th>
                            </Table.Tr>
                        </Table.Tfoot>
                    </Table>
                </Table.ScrollContainer>}
            </GraphWithStatCard>
        </RoleWrapper>
    );
};

export default ErrorsByUser;
