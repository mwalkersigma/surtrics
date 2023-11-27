import React, {useState} from "react";

import useUpdates from "../../../modules/hooks/useUpdates";
import makeDateArray from "../../../modules/utils/makeDateArray";
import formatDatabaseRows from "../../../modules/utils/formatDatabaseRows";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {DatePickerInput} from "@mantine/dates";
import {Table} from "@mantine/core";


const formatTimeStamps = (timeStamp) => timeStamp.split("T")[0];

const conversionTable = {
    "Add": ["Add Add", "Add Add on Receiving"],
    "Relisting": ["Add Relisting"],
    "Total": ["Total"]

}

export default function WeeklyView() {
    const [field, setField] = useState("Total");
    const [date, setDate] = useState(new Date());
    const databaseRows = useUpdates("/api/views/quantity/weeklyView", {date});


    let rows = formatDatabaseRows(databaseRows);
    let users = Object.keys(rows);
    let dates = makeDateArray(date);


    const handleChange = (name) => () => setField(name);
    const isActiveField = (name) => field === name;


    return (
        <GraphWithStatCard
            title={"Surplus Quantity Weekly View"}
            isLoading={databaseRows.length === 0}
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


    // return (
    //     <Container>
    //         <h1 className={"text-center"}>Quantity View</h1>
    // <Form.Control
    //             className={"mb-3"}
    //             value={date}
    //             onChange={(e)=>setDate(e.target.value)}
    //             type="date"
    //         />
    //
    //         <div className={"mb-3"}>
    //             <Form>
    //                 <Form.Check
    //                     checked={isActiveField("Add")}
    //                     onChange={handleChange("Add")}
    //                     type={"radio"}
    //                     inline
    //                     name={"group1"}
    //                     label={"Add"}
    //                 />
    //                 <Form.Check
    //                     checked={isActiveField("Relisting")}
    //                     onChange={handleChange("Relisting")}
    //                     type={"radio"}
    //                     inline
    //                     name={"group1"}
    //                     label={"Relisting"}
    //                 />
    //                 <Form.Check
    //                     checked={isActiveField("Total")}
    //                     onChange={handleChange("Total")}
    //                     type={"radio"}
    //                     inline
    //                     name={"group1"}
    //                     label={"Total"}
    //                 />
    //             </Form>
    //         </div>
    //         <Table striped bordered hover>
    //             <thead>
    //                 <tr>
    //                     <th>User</th>
    //                     {dates.map((date,index) => <th key={index}>{formatTimeStamps(date)}</th>)}
    //                     <th className={""}>Total</th>
    //                 </tr>
    //             </thead>
    //             <tbody>
    //                 {users.map((user,index) => (
    //                         <tr key={index}>
    //                             <td>{user}</td>
    //                             {dates.map((date,index) => {
    //                                 let dateString = `${date}`
    //                                 let dateData = rows[user][dateString];
    //                                 let converter = conversionTable[field];
    //                                 if(!dateData) return <td key={index}>0</td>
    //                                 if(converter) {
    //                                     let sum = 0;
    //                                     for (let i = 0; i < converter.length; i++) {
    //                                         sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
    //                                     }
    //                                     return <td key={index}>{sum}</td>
    //                                 }
    //                                 return <td key={index}>0</td>
    //                             })}
    //                             <td className={""}>{Object.values(rows[user]).reduce((acc,curr)=>{
    //                                 let sum = 0;
    //                                 let converter = conversionTable[field];
    //                                 for(let i = 0 ; i < converter.length ; i++){
    //                                     sum += curr[converter[i]] ? curr[converter[i]] : 0;
    //                                 }
    //                                 return acc + sum;
    //                             },0)}</td>
    //                         </tr>
    //                     )
    //                 )}
    //                 <tr className={"table-secondary"}>
    //                     <td>Daily Total</td>
    //                     {dates.map((date,index) => {
    //                         let dateString = `${date}`
    //                         let sum = 0;
    //                         for(let user of users){
    //                             let dateData = rows[user][dateString];
    //                             let converter = conversionTable[field];
    //                             if(!dateData) continue;
    //                             for(let i = 0 ; i < converter.length ; i++){
    //                                 sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
    //                             }
    //                         }
    //                         return <td key={index}>{sum}</td>
    //                     })}
    //                     <td>{
    //                         users.reduce((acc,curr) => {
    //                             let sum = 0;
    //                             for(let date in rows[curr]){
    //                                 let dateData = rows[curr][date];
    //                                 let converter = conversionTable[field];
    //                                 for(let i = 0 ; i < converter.length ; i++){
    //                                     sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
    //                                 }
    //                             }
    //                             return acc + sum;
    //                         },0)
    //                     }</td>
    //                 </tr>
    //             </tbody>
    //         </Table>
    //     </Container>
    // )
}