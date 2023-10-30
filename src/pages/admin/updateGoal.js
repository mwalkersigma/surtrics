import React, {useEffect, useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {useSession} from "next-auth/react";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import useGoal from "../../modules/hooks/useGoal";
import ToastContainerWrapper from "../../components/toast/toastContainerWrapper";
import useToastContainer from "../../modules/hooks/useToast";
import createSuccessMessage from "../../modules/serverMessageFactories/createSuccessMessage";


const UpdateGoal = () => {
    const {data: session} = useSession();
    const [eventDate,setEventDate] = useState(formatDateWithZeros(new Date()));
    const [messages,set,remove] = useToastContainer();
    let goal = useGoal();
    const [newGoal, setNewGoal] = useState('');
    const [displayGoal,setDisplayGoal] = useState(goal * 5);
    useEffect(() => {
        setDisplayGoal(goal * 5)
    }, [goal,newGoal]);

    function handleSubmit () {
        if(!newGoal) return;
        if(!newGoal > 0) return;
        const event = {
            goal_date:eventDate,
            goal_amount:newGoal,
            user_who_submitted:userName,
            session
        }
        fetch(`${window.location.origin}/api/admin/goal`,{
            method:"PUT",
            body:JSON.stringify(event)
        })
        .then((res)=>res.text())
        .then((text) => {
            set(createSuccessMessage(text))
            setDisplayGoal(newGoal)
        })
    }


    const userName = session?.user?.name;
    return (
        <RoleWrapper altRoles={["surplus director"]}>
            <ToastContainerWrapper serverMessages={messages} removeServerMessages={remove} />
            <Container>
                <h1 className={"text-center my-5"}>Update Goal</h1>
                <Form>
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label>Date Of Change</Form.Label>
                            <Form.Control value={eventDate} onChange={(e)=>setEventDate(e.target.value)} type={"date"} placeholder={"Event Date"}/>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>User Who Submitted</Form.Label>
                            <Form.Control type={"text"} value={userName} disabled/>
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col}>
                            <Form.Label>Goal Amount</Form.Label>
                            <Form.Control type={"number"} onChange={(e)=>setNewGoal(e.target.value)} value={newGoal} placeholder={displayGoal} />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Current Goal</Form.Label>
                            <Form.Control disabled readOnly placeholder={newGoal} value={displayGoal} type={"number"} />
                        </Form.Group>
                    </Row>
                    <Row>
                        <Button
                            onClick={handleSubmit}
                            size={'lg'}
                            className={"mx-2 mt-3"}
                        >Submit</Button>
                    </Row>
                </Form>
            </Container>
        </RoleWrapper>
    );
};

export default UpdateGoal;