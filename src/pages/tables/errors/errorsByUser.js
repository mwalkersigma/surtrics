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

    const [user, setUser] = useState("Total")

    const users = ["Total",...new Set(errors.map(({user}) => user))];

    const dataOrderedByUser = users.reduce((acc,user)=>{
        const userErrors = errors.filter((error)=>error.user === user);
        const userErrorsByDate = userErrors.reduce((acc,error)=>{
            const date = new Date(error.transaction_date).toLocaleDateString();
            if(!acc[date]){
                acc[date] = {Total:0};
            }
            acc[date][error.transaction_reason] = acc[date][error.transaction_reason] ? acc[date][error.transaction_reason] + 1 : 1;
            acc[date]["Total"] +=1;
            return acc;
        },{});
        acc[user] = userErrorsByDate;
        return acc;
    },{});
    dataOrderedByUser["Total"] = errors?.reduce((acc,error)=>{
        const date = new Date(error.transaction_date).toLocaleDateString();
        if(!acc[date]){
            acc[date] = {};
        }
        acc[date][error.transaction_reason] = acc[date][error.transaction_reason] ? acc[date][error.transaction_reason] + 1 : 1;
        return acc;
    },{});


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
                <div
                    style={{overflowY: "scroll", maxHeight: "65vh"}}
                >
                    {userErrors &&
                    <Table
                        striped
                        highlightOnHover
                        withTableBorder
                        withColumnBorders
                        stickyHeader
                        miw={700}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Date</Table.Th>
                                {errorReasons.map((reason, i) => <Table.Td key={i}>{reason}</Table.Td>)}
                                <Table.Th>Total</Table.Th>
                            </Table.Tr>

                        </Table.Thead>

                        <Table.Tbody>
                            {
                                dates.map((date, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>{date}</Table.Td>
                                        {errorReasons.map((reason, i) => (
                                            <Table.Td key={i}>{userErrors[date][reason] ?? 0}</Table.Td>
                                        ))}
                                        <Table.Td>
                                            {Object.values(userErrors[date]).reduce((acc, reason) => acc + reason, 0)}
                                        </Table.Td>

                                        {/*<Table.Th>{Object.values(userErrors).reduce((acc,date)=>acc + Object.values(date).reduce((acc,reason)=>acc + reason,0),0)}</Table.Th>*/}
                                    </Table.Tr>
                                ))
                            }
                        </Table.Tbody>
                        <Table.Tfoot>
                            <Table.Tr>
                                <Table.Th>Total</Table.Th>
                                {errorReasons.map((reason, i) => (
                                    <Table.Th
                                        key={i}>{Object.values(userErrors).reduce((acc, date) => acc + (date[reason] ?? 0), 0)}</Table.Th>
                                ))}
                                <Table.Th>{Object.values(userErrors).reduce((acc,date)=>acc + Object.values(date).reduce((acc,reason)=>acc + reason,0),0)}</Table.Th>
                            </Table.Tr>
                        </Table.Tfoot>
                    </Table>
                    }
                </div>
            </GraphWithStatCard>
        </RoleWrapper>
    );
};

export default ErrorsByUser;
