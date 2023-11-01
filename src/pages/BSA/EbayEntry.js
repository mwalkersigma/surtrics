import React, {useEffect, useState} from 'react';
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
import createSuccessMessage from "../../modules/serverMessageFactories/createSuccessMessage";
import useToastContainer from "../../modules/hooks/useToast";
import ToastContainerWrapper from "../../components/toast/toastContainerWrapper";
import createErrorMessage from "../../modules/serverMessageFactories/createErrorMessage";


const useBasicForm = (initialState) => {
    const [formState, setFormState] = useState(initialState);
    const handleChange = (key) => (e) => {
        setFormState({...formState, [key]: e.target.value});
    };
    const handleReset = () => {
        setFormState(initialState);
    }
    return [formState, handleChange, handleReset];

}
const EbayEntry = () => {
    const {data: session} = useSession();
    const userName = session?.user?.name;
    const [serverMessages, setServerMessage, removeServerMessage] = useToastContainer();
    const [formState, handleChange,handleReset] = useBasicForm({
        impressions: 0,
        page_views: 0,
        date_for_week: formatDateWithZeros(addDays(findStartOfWeek(new Date()),1)),
        user_who_submitted: "",
    })
    useEffect(() => {
        handleChange("user_who_submitted")({target:{value:userName}});
    }, [userName]);

    function handleDate(e){
        handleChange("date_for_week")
        (formatDateWithZeros(addDays(findStartOfWeek(new Date(e.target.value)),1)));
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
    function handleSubmit(){
        fetch(`${window.location.origin}/api/dataEntry/ebay`,{
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
        <RoleWrapper altRoles={"bsa"}>
            <ToastContainerWrapper serverMessages={serverMessages} removeServerMessages={removeServerMessage}/>
            <Container>
                <h1 className={"text-center my-4"}>Ebay </h1>
                <Form>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_ebay_impression"}>
                            <Form.Label>Impression</Form.Label>
                            <Form.Control
                                type={"number"}
                                placeholder={"Ebay Impression"}
                                value={formState.impressions}
                                onChange={handleChange("impressions")}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_ebay_page_views"}>
                            <Form.Label>Page Views</Form.Label>
                            <Form.Control
                                type={"number"}
                                placeholder={"Ebay Page Views"}
                                value={formState.page_views}
                                onChange={handleChange("page_views")}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_for_week"}>
                            <Form.Label>for week</Form.Label>
                            <Form.Control
                                type={"date"}
                                value={formState.date_for_week}
                                onChange={handleDate}
                            />
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_control_user_who_submitted"}>
                            <Form.Label>Who Submitted</Form.Label>
                            <Form.Control
                                type={"text"}
                                disabled
                                readOnly
                                placeholder={formState.user_who_submitted}
                            />
                        </Form.Group>
                        <Col>
                            <Stack className={"justify-content-end align-items-lg-stretch h-100"}>
                                <Button onClick={handleSubmit} variant={"primary"}>Submit</Button>
                            </Stack>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </RoleWrapper>
    );
};

export default EbayEntry;