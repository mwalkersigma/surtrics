import React, {useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {useSession} from "next-auth/react";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import useGoal from "../../modules/hooks/useGoal";


const EventReporting = () => {
    /**
     * @Interface Event
     * @property {string} event_name
     * @property {string} event_date
     * @property {string} event_notes
     * @property {string} affected_categories
     * @property {string} user_who_submitted
     */
    const {data: session} = useSession();
    const [eventDate,setEventDate] = useState(formatDateWithZeros(new Date()));
    const goal = useGoal();
    const [newGoal, setNewGoal] = useState(null);


    function handleSubmit () {
        if(!newGoal) return;
        const event = {
            goal_date:eventDate,
            goal_amount:newGoal,
            user_who_submitted:userName,
            session
        }
        fetch(`${window.location.origin}/api/admin/submitGoal`,{
            method:"POST",
            body:JSON.stringify(event)
        })
        .then((res)=>res.text())
    }


    const userName = session?.user?.name;
    return (
        <RoleWrapper altRoles={["surplus director"]}>
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
                            <Form.Control type={"number"} onChange={(e)=>setNewGoal(e.target.value)} value={Number(newGoal)} placeholder={goal * 5} />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Current Goal</Form.Label>
                            <Form.Control disabled readOnly value={goal * 5} type={"number"} />
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

export default EventReporting;