import React, {useEffect} from 'react';
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
import createSuccessMessage from "../../modules/serverMessageFactories/createSuccessMessage";
import createErrorMessage from "../../modules/serverMessageFactories/createErrorMessage";
import useToastContainer from "../../modules/hooks/useToast";
import useBasicForm from "../../modules/hooks/useBasicForm";
import ToastContainerWrapper from "../../components/toast/toastContainerWrapper";

const BigCommerceEntry = () => {
    const {data: session} = useSession();
    const userName = session?.user?.name;
    const [serverMessages, setServerMessage, removeServerMessage] = useToastContainer();
    const [formState, handleChange,handleReset] = useBasicForm({
        visits: 0,
        shopped: 0,
        add_to_cart: 0,
        web_leads: 0,
        date_for_week: formatDateWithZeros(addDays(findStartOfWeek(new Date()),1)),
        user_who_submitted: "",
    });
    function handleDate(e){
        let update = {target:{value:formatDateWithZeros(addDays(findStartOfWeek(new Date(e.target.value)),1))}};
        handleChange("date_for_week")
        (update);
    }

    function handleSubmit(){
        fetch(`${window.location.origin}/api/dataEntry/bigCommerce`,{
            method:"PUT",
            body:JSON.stringify(formState)
        })
            .then((res)=>res.json())
            .then(({message,response})=>{
                console.log(response)
                setServerMessage(createSuccessMessage(message))
                handleReset();
            })
            .catch((err)=>{
                setServerMessage(createErrorMessage(err.message))
            })
    }

    useEffect(() => {
        handleChange("user_who_submitted")({target:{value:userName}});
    }, [userName,formState.user_who_submitted]);

    return (
        <RoleWrapper altRoles={"bsa"}>
            <ToastContainerWrapper serverMessages={serverMessages} removeServerMessages={removeServerMessage}/>
            <Container>
                <h1 className={"text-center my-4"}>Big Commerce </h1>
                <Form>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_control_visits"}>
                            <Form.Label>Visits</Form.Label>
                            <Form.Control
                                type={"number"}
                                placeholder={"Visits"}
                                value={formState.visits}
                                onChange={handleChange("visits")}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_shopped"}>
                            <Form.Label>Shopped</Form.Label>
                            <Form.Control
                                type={"number"}
                                placeholder={"Shopped"}
                                value={formState.shopped}
                                onChange={handleChange("shopped")}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_add_to_cart"}>
                            <Form.Label>Add to Cart</Form.Label>
                            <Form.Control
                                type={"number"}
                                placeholder={"Add to Cart"}
                                value={formState.add_to_cart}
                                onChange={handleChange("add_to_cart")}
                            />
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_control_web_leads"}>
                            <Form.Label>Web Leads</Form.Label>
                            <Form.Control
                                type={"number"}
                                placeholder={"Web Leads"}
                                value={formState.web_leads}
                                onChange={handleChange("web_leads")}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId={"form_control_for_Week"}>
                            <Form.Label>For Week of</Form.Label>
                            <Form.Control type={"date"} onChange={handleDate} value={formState.date_for_week}/>
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col} controlId={"form_control_user_who_submitted"}>
                            <Form.Label>User Who Submitted</Form.Label>
                            <Form.Control type={"text"} disabled readOnly placeholder={formState.user_who_submitted}/>
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

export default BigCommerceEntry;