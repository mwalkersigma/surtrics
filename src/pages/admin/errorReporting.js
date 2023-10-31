import React, {useEffect, useState} from 'react';

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack"

import {useSession} from "next-auth/react";

import RoleWrapper from "../../components/RoleWrapper";
import ToastContainerWrapper from "../../components/toast/toastContainerWrapper";

import useToastContainer from "../../modules/hooks/useToast";
import createErrorMessage from "../../modules/serverMessageFactories/createErrorMessage";
import createSuccessMessage from "../../modules/serverMessageFactories/createSuccessMessage";

const ignoreList = [
    "BSA",
    "mbittner",
    "Receiving Errors 1",
    "Receiving Station 1",
    "Receiving Station 2",
    "Receiving Station 3",
    "SkuVault Support",
    "System",
    "Testing Shared Account"
]
function validate(state){
    const {user,reason,notes} = state;
    const noteLength = notes.length;
    return !(!user || !reason || noteLength > 255);
}

const ErrorReporting = () => {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const {data:session,status} = useSession();

    const [serverMessages, setServerMessage, removeServerMessage] = useToastContainer();

    useEffect(() => {
        fetch(`${window.location.origin}/api/getUsers`)
            .then((res)=>res.json())
            .then((res)=>setUsers(res))
            .catch((err)=>console.log(err))
    }, []);
    function handleSubmit () {
        const state = JSON.stringify({user,reason,notes,session});
        setLoading(true)
        if(!validate({user,reason,notes})){
            setLoading(false);
            return setServerMessage(createErrorMessage("Please fill out all fields"))
        }
        fetch(`${window.location.origin}/api/admin/error`,{
            method:"PUT",
            body:state
        })
        .then((res)=>res.text())
        .then((res)=>{setServerMessage(createSuccessMessage(res))})
        .catch((err)=>{setServerMessage(createErrorMessage(err))})
        .finally(()=>{
            setUser("");
            setReason("");
            setNotes("");
            setLoading(false);
        })
    }

    return (
        <RoleWrapper altRoles={["surplus director","bsa"]}>
            <ToastContainerWrapper serverMessages={serverMessages} removeServerMessages={removeServerMessage}/>
                <Container>
                    <h1>Error Reporting</h1>
                    <Form>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>User</Form.Label>
                                <Form.Select value={user} onChange={(e)=>setUser(e.target.value)}>
                                    <option>Choose a user</option>
                                    {users.filter((user)=>!ignoreList.includes(user.user_name)).map((user)=>(
                                        <option key={user.user_name} value={user.user_name}>{user.user_name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>Reason</Form.Label>
                                <Form.Select value={reason} onChange={(e)=>setReason(e.target.value)}>
                                    <option>Choose a reason</option>
                                    <option value={"no photo"}>No Photo</option>
                                    <option value={"not approved"}>Not Approved</option>
                                    <option value={"wrong label"}>Wrong Label</option>
                                    <option value={"no location"} >No Location</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>
                                    Notes <small className={"text-sm-start text-secondary"}>( 255 char max )</small>
                                </Form.Label>
                                <Form.Control
                                    value={notes}
                                    onChange={(e)=>setNotes(e.target.value)}
                                    as="textarea"
                                    rows={3}
                                />
                            </Form.Group>
                        </Row>
                        <hr/>
                        <Row>
                            <Stack>
                                <Button disabled={loading} onClick={handleSubmit} size={"lg"} variant={"primary"}>Submit</Button>
                            </Stack>
                        </Row>
                    </Form>
                </Container>
        </RoleWrapper>
    );
};

export default ErrorReporting;