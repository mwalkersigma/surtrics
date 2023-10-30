import React, {useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useSession} from "next-auth/react";
import findStartOfWeek from "../../modules/utils/findSundayFromDate";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import {addDays} from "date-fns";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
const BigCommerceEntry = () => {
    const {data: session} = useSession();
    const userName = session?.user?.name;
    const [date,setDate] = useState(formatDateWithZeros(addDays(findStartOfWeek(new Date()),1)));
    function handleDate(e){
        setDate(formatDateWithZeros(addDays(findStartOfWeek(new Date(e.target.value)),1)));
    }
    return (
        <RoleWrapper altRoles={"bsa"}>
            <Container>
                <h1 class={"text-center my-4"}>Big Commerce ( non-functioning ) </h1>
                <Form>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_control_visits"}>
                            <Form.Label>Visits</Form.Label>
                            <Form.Control type={"number"} placeholder={"Visits"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_shopped"}>
                            <Form.Label>Shopped</Form.Label>
                            <Form.Control type={"number"} placeholder={"Shopped"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_add_to_cart"}>
                            <Form.Label>Add to Cart</Form.Label>
                            <Form.Control type={"number"} placeholder={"Add to Cart"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_purchased"}>
                            <Form.Label>Purchased</Form.Label>
                            <Form.Control type={"number"} placeholder={"Purchased"}/>
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_control_sales"}>
                            <Form.Label>Sales</Form.Label>
                            <Form.Control type={"number"} placeholder={"Sales"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_web_leads"}>
                            <Form.Label>Web Leads</Form.Label>
                            <Form.Control type={"number"} placeholder={"Web Leads"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_for_Week"}>
                            <Form.Label>For Week of</Form.Label>
                            <Form.Control type={"date"} onChange={handleDate} value={date}/>
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_control_user_who_submitted"}>
                            <Form.Label>User Who Submitted</Form.Label>
                            <Form.Control type={"text"} disabled readOnly value={userName}/>
                        </Form.Group>
                        <Col>
                            <Stack className={"justify-content-end align-items-lg-stretch h-100"}>
                                <Button variant={"primary"}>Submit</Button>
                            </Stack>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </RoleWrapper>
    );
};

export default BigCommerceEntry;