import React from 'react';
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import {Col, InputGroup, Row} from "react-bootstrap";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
// purchase types are: auction, no list , targetted;
const QuickBooks = () => {
    return (
        <Container>
            <h1>Quick Books</h1>
            <Form>
                <Row className={"my-3"}>
                    <Form.Group as={Col} controlId={"form_control_name"}>
                        <Form.Label>Customer Name</Form.Label>
                        <Form.Control type={"text"} placeholder={"Name"}/>
                    </Form.Group>
                    <Form.Group as={Col} controlId={"form_control_date"}>
                        <Form.Label>Date Of Sales</Form.Label>
                        <Form.Control type={"date"}/>
                    </Form.Group>
                </Row>
                <Row className={"my-3"}>
                    <Form.Group as={Col} controlId={"form_control_total"}>
                        <Form.Label>Total Amount</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control type={"currency"} placeholder={"Total"}/>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col} controlId={"form_control_purchase_type"}>
                        <Form.Label>Tax</Form.Label>
                        <Form.Select type={"select"}>
                            <option>----------------- Select option ------------------</option>
                            <option value={"auction"}>Auction</option>
                            <option value={"no_list"}>No List</option>
                            <option value={"targeted"}>Targeted</option>
                        </Form.Select>
                    </Form.Group>
                </Row>
                <Row className={"my-3"}>
                    <Form.Group as={Col} controlId={"form_control_user_who_submitted"}>
                        <Form.Label>User Who Submitted</Form.Label>
                        <Form.Control type={"text"} placeholder={"User Who Submitted"}/>
                    </Form.Group>
                    <Col>
                        <Stack className={"justify-content-end align-items-lg-stretch h-100"}>
                            <Button variant={"primary"}>Submit</Button>
                        </Stack>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default QuickBooks;