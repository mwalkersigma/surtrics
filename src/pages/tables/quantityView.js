import React, {useState} from "react";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import useUpdates from "../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import Table from "react-bootstrap/Table";
import makeDateArray from "../../modules/utils/makeDateArray";
import formatDatabaseRows from "../../modules/utils/formatDatabaseRows";



const formatTimeStamps = (timeStamp) => timeStamp.split("T")[0];

const conversionTable = {
    "Add" : ["Add Add","Add Add on Receiving"],
    "Relisting" : ["Add Relisting"],
    "Total" : ["Total"]

}



export default function QuantityView () {
    const [field, setField] = useState("Total");
    const [date,setDate] = useState(formatDateWithZeros(new Date()));
    const databaseRows = useUpdates("/api/views/quantity/weeklyView",{date});

    if(!databaseRows.length > 0) return (<div className={"text-center"}>Loading...</div>);

    let rows = formatDatabaseRows(databaseRows);
    let users = Object.keys(rows);

    let dates = makeDateArray(date);



    const handleChange = (name) => () => setField(name);
    const isActiveField = (name) => field === name;
    return (
        <Container>
            <h1>Quantity View</h1>
            <Form.Control
                className={"mb-3"}
                value={date}
                onChange={(e)=>setDate(e.target.value)}
                type="date"
            />

            <div className={"mb-3"}>
                <Form>
                    <Form.Check
                        checked={isActiveField("Add")}
                        onChange={handleChange("Add")}
                        type={"radio"}
                        inline
                        name={"group1"}
                        label={"Add"}
                    />
                    <Form.Check
                        checked={isActiveField("Relisting")}
                        onChange={handleChange("Relisting")}
                        type={"radio"}
                        inline
                        name={"group1"}
                        label={"Relisting"}
                    />
                    <Form.Check
                        checked={isActiveField("Total")}
                        onChange={handleChange("Total")}
                        type={"radio"}
                        inline
                        name={"group1"}
                        label={"Total"}
                    />
                </Form>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>User</th>
                        {dates.map((date,index) => <th key={index}>{formatTimeStamps(date)}</th>)}
                        <th className={""}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user,index) => (
                            <tr key={index}>
                                <td>{user}</td>
                                {dates.map((date,index) => {
                                    let dateString = `${date}T05:00:00.000Z`
                                    let dateData = rows[user][dateString];
                                    let converter = conversionTable[field];
                                    if(!dateData) return <td key={index}>0</td>
                                    if(converter) {
                                        let sum = 0;
                                        for (let i = 0; i < converter.length; i++) {
                                            sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
                                        }
                                        return <td key={index}>{sum}</td>
                                    }
                                    return <td key={index}>0</td>
                                })}
                                <td className={""}>{Object.values(rows[user]).reduce((acc,curr)=>{
                                    let sum = 0;
                                    let converter = conversionTable[field];
                                    for(let i = 0 ; i < converter.length ; i++){
                                        sum += curr[converter[i]] ? curr[converter[i]] : 0;
                                    }
                                    return acc + sum;
                                },0)}</td>
                            </tr>
                        )
                    )}
                    <tr className={"table-secondary"}>
                        <td>Daily Total</td>
                        {dates.map((date,index) => {
                            let dateString = `${date}T05:00:00.000Z`
                            let sum = 0;
                            for(let user of users){
                                let dateData = rows[user][dateString];
                                let converter = conversionTable[field];
                                if(!dateData) continue;
                                for(let i = 0 ; i < converter.length ; i++){
                                    sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
                                }
                            }
                            return <td key={index}>{sum}</td>
                        })}
                        <td>{
                            users.reduce((acc,curr) => {
                                let sum = 0;
                                for(let date in rows[curr]){
                                    let dateData = rows[curr][date];
                                    let converter = conversionTable[field];
                                    for(let i = 0 ; i < converter.length ; i++){
                                        sum += dateData[converter[i]] ? dateData[converter[i]] : 0;
                                    }
                                }
                                return acc + sum;
                            },0)
                        }</td>
                    </tr>
                </tbody>
            </Table>
        </Container>
    )
}