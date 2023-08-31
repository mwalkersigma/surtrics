import React, {useState} from 'react';
import useUpdates from "../modules/hooks/useUpdates";
import Container from "react-bootstrap/Container";
import {Table, Form, InputGroup} from "react-bootstrap";

const IndividualView = () => {
    const [chosenUser, setChosenUser] = useState("");
    const [date, setChosenDate] = useState(new Date());
    let individualData = useUpdates("/api/views/individualView",{date});
    if(!individualData.length > 0) return (<div className={"text-center"}>Loading...</div>);
    individualData = JSON.parse(individualData);
    let users = Object.keys(individualData);
    const setDate = (date) => {
        setChosenDate(date);
        setChosenUser("Choose a user")
    };
    return (
        <Container>
            <InputGroup>
                <Form.Select value={chosenUser} onChange={(e)=>setChosenUser(e.target.value)} className={"mb-4"}>
                    <option>Choose a user</option>
                    {users.map((user, index) => <option key={index}>{user}</option>)}
                </Form.Select>
                <Form.Control
                    type={"date"}
                    onChange={(e) => setDate(new Date(e.target.value))}
                    className={"mb-4"}
                    defaultValue={date.toISOString().split("T")[0]}
                />
            </InputGroup>

            <Table bordered hover responsive striped>
                <thead>
                <tr>
                    <th>User</th>
                    <th>Transaction Type</th>
                    <th>Transaction Reason</th>
                    <th>Count</th>
                </tr>
                </thead>
                <tbody>
                {users.length > 0 && users
                    .filter((user) => user === chosenUser)
                    .map((row, index) => {
                    let userData = individualData[row];
                    return Object
                        .entries(userData)
                        .map(([key, value]) => {
                            let [transaction_type, transaction_reason] = key.split(" ");
                            return (
                                <tr key={index + key}>
                                    <td>{row}</td>
                                    <td>{transaction_type}</td>
                                    <td>{transaction_reason}</td>
                                    <td>{+value}</td>
                                </tr>
                            )
                        })

                }
                )}
                </tbody>
            </Table>
        </Container>
    );
};

export default IndividualView;