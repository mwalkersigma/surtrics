import React, {useContext, useState} from "react";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";

import useUpdates from "../../modules/hooks/useUpdates";

import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import getStartAndEndWeekString from "../../modules/utils/getStartAndEndWeekString";

import {ThemeContext} from "../layout";
import {addDays, addHours} from "date-fns";
import {Table} from "react-bootstrap";



const formatTimeStamps = (timeStamp) => timeStamp.split("T")[0];

const conversionTable = {
    "Add" : ["Add Add","Add Add on Receiving"],
    "Relisting" : ["Add Relisting"],
    "Total" : ["Total"]

}

function formatDatabaseRows(rows){
    let result = {};
    for(let i = 0 ; i < rows.length ; i++){
        let {name, type, reason, sum, date} = rows[i];
        if(!result[name]){
            result[name] = {};
        }
        if(!result[name][date]){
            result[name][date] = {};
        }
        if(!result[name][date][`${type} ${reason}`]){
            result[name][date][`${type} ${reason}`] = 0;
        }
        result[name][date][`${type} ${reason}`] += +sum;
    }

    for(let user in result){
        for(let date in result[user]){
            let sum = 0;
            for(let transaction in result[user][date]){
                sum += result[user][date][transaction];
            }
            result[user][date]["Total"] = sum;
        }
    }
    return result;
}

export default function QuantityView () {
    const [field, setField] = useState("Total");
    const [date,setDate] = useState(formatDateWithZeros(new Date()));
    const databaseRows = useUpdates("/api/views/quantity/weeklyView",{date});
    const theme = useContext(ThemeContext);

    if(!databaseRows.length > 0) return (<div className={"text-center"}>Loading...</div>);

    let rows = formatDatabaseRows(databaseRows);
    let users = Object.keys(rows);

    const [startString] = getStartAndEndWeekString(new Date(date));

    let dates = [startString];

    for(let day = 1 ; day < 7 ; day++){
        let date = new Date(startString);
        date = addHours(date,5);
        date = addDays(date,day);
        dates.push(formatDateWithZeros(date));
    }


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
                                    console.log(dateData)
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