import React, {useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import {useSession} from "next-auth/react";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import {addDays} from "date-fns";
import findStartOfWeek from "../../modules/utils/findSundayFromDate";

const EbayEntry = () => {
    const {data: session} = useSession();
    const userName = session?.user?.name;
    const [date,setDate] = useState(formatDateWithZeros(addDays(findStartOfWeek(new Date()),1)));
    function handleDate(e){
        setDate(formatDateWithZeros(addDays(findStartOfWeek(new Date(e.target.value)),1)));
    }
    /*
    *
    * ebay_impression
    * ebay page_views
    * ebay_sold
    * ebay_click_through_rate
    * ebay_conversion
    * ebay_sales
     */
    return (
        <RoleWrapper altRoles={"bsa"}>
            <Container>
                <h1 class={"text-center my-4"}>Ebay ( non-functioning ) </h1>
                <Form>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_ebay_impression"}>
                            <Form.Label>Impression</Form.Label>
                            <Form.Control type={"number"} placeholder={"Ebay Impression"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_ebay_page_views"}>
                            <Form.Label>Page Views</Form.Label>
                            <Form.Control type={"number"} placeholder={"Ebay Page Views"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_ebay_sales"}>
                            <Form.Label>Sales</Form.Label>
                            <Form.Control type={"number"} placeholder={"Ebay Sales"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_user_who_submitted"}>
                            <Form.Label>for week</Form.Label>
                            <Form.Control type={"date"} value={date} onChange={handleDate}/>
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_ebay_click_through_rate"}>
                            <Form.Label>Click Through Rate</Form.Label>
                            <Form.Control type={"number"} placeholder={"Ebay Click Through Rate"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_ebay_conversion"}>
                            <Form.Label>Conversion</Form.Label>
                            <Form.Control type={"number"} placeholder={"Ebay Conversion"}/>
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_ebay_sold"}>
                            <Form.Label>Sold</Form.Label>
                            <Form.Control type={"number"} placeholder={"Ebay Sold"}/>
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_control_user_who_submitted"}>
                            <Form.Label>Who Submitted</Form.Label>
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

export default EbayEntry;