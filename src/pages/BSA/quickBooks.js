import React, {useEffect} from 'react';
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import {Col, InputGroup, Row} from "react-bootstrap";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import useBasicForm from "../../modules/hooks/useBasicForm";
import {useSession} from "next-auth/react";
import useToastContainer from "../../modules/hooks/useToast";
import ToastContainerWrapper from "../../components/toast/toastContainerWrapper";
import createSuccessMessage from "../../modules/serverMessageFactories/createSuccessMessage";
import createErrorMessage from "../../modules/serverMessageFactories/createErrorMessage";


// purchase types are: auction, no list , targetted;
const QuickBooks = () => {
    const {data: session} = useSession();
    const userName = session?.user?.name;

    const [formState, handleChange,handleReset] = useBasicForm({
        customer_name: "",
        po_number: "",
        date_of_sale: "",
        purchase_type: "",
        total_amount: 0,
    });

    const [serverMessages, setServerMessage, removeServerMessage] = useToastContainer();


    function handleSubmit () {
        fetch(`${window.location.origin}/api/dataEntry/quickBooks`,{
            method:"PUT",
            body:JSON.stringify(formState)
        })
            .then((res)=>res.json())
            .then(({message})=>{
                setServerMessage(createSuccessMessage(message))
                handleReset();
            })
            .catch((err)=>{
                setServerMessage(createErrorMessage(err.message))
            })
    }

    return (
        <Container>
            <ToastContainerWrapper serverMessages={serverMessages} removeServerMessages={removeServerMessage}/>
            <h1 className={"my-5 text-center"}>Quick Books</h1>
            <Form>
                <Row className={"my-3"}>
                    <Form.Group as={Col} controlId={"form_control_name"}>
                        <Form.Label>Customer Name</Form.Label>
                        <Form.Control
                            type={"text"}
                            placeholder={"Name"}
                            value={formState.customer_name}
                            onChange={handleChange("customer_name")}
                        />
                    </Form.Group>
                    <Form.Group as={Col} controlId={"form_control_po"}>
                        <Form.Label>PO Number</Form.Label>
                        <Form.Control
                            type={"text"}
                            placeholder={"PO Number"}
                            value={formState.po_number}
                            onChange={handleChange("po_number")}
                        />
                    </Form.Group>
                    <Form.Group as={Col} controlId={"form_control_date"}>
                        <Form.Label>Date Of Sales</Form.Label>
                        <Form.Control
                            type={"date"}
                            value={formState.date_of_sale}
                            onChange={handleChange("date_of_sale")}
                        />
                    </Form.Group>
                </Row>
                <Row className={"my-3"}>
                    <Form.Group as={Col} controlId={"form_control_total"}>
                        <Form.Label>Total Amount</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control
                                type={"currency"}
                                placeholder={"Total"}
                                value={formState.total_amount}
                                onChange={handleChange("total_amount")}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col} controlId={"form_control_purchase_type"}>
                        <Form.Label>Purchase Type</Form.Label>
                        <Form.Select
                            type={"select"}
                            value={formState.purchase_type}
                            onChange={handleChange("purchase_type")}
                        >
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
                        <Form.Control type={"text"} disabled readOnly placeholder={userName}/>
                    </Form.Group>
                    <Col>
                        <Stack className={"justify-content-end align-items-lg-stretch h-100"}>
                            <Button onClick={handleSubmit} variant={"primary"}>Submit</Button>
                        </Stack>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default QuickBooks;