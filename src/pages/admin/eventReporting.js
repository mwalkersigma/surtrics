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

function useCategories(list){
    let categories = {};
    list.forEach((item)=>{
        categories[item] = false;
    });
    let [categoryState, setCategoryState] = useState(categories);
    function toggleCategory(category){
        setCategoryState({...categoryState,[category]:!categoryState[category]})
    }
    return [categoryState,toggleCategory];
}


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
    const [otherCategory,setOtherCategory] = useState({
        name:"",
        checked:false
    });
    const [categoryState,toggleCategory] = useCategories([
        "Increments",
        "Quantity",
        "Approvals",
        "Errors",
        "Warehouse"
    ])
    const [eventTitle,setEventTitle] = useState("");
    const [eventDate,setEventDate] = useState(formatDateWithZeros(new Date()));
    const [eventNotes,setEventNotes] = useState("");


    function handleSubmit () {
        let affectedCategories = [];
        Object.keys(categoryState).forEach((category)=>{
            if(categoryState[category]) affectedCategories.push(category);
        })
        if(otherCategory.checked) affectedCategories.push(otherCategory.name);
        const event = {
            event_name:eventTitle,
            event_date:eventDate,
            event_notes:eventNotes,
            affected_categories:affectedCategories,
            user_who_submitted:userName,
            session
        }
        fetch(`${window.location.origin}/api/admin/submitEvent`,{
            method:"POST",
            body:JSON.stringify(event)
        })
            .then((res)=>res.text())
    }


    const userName = session?.user?.name;
    return (
        <RoleWrapper altRoles={["surplus director"]}>
            <Container>
                <h1>Event Reporting</h1>
                <Form>
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label>Event Name </Form.Label>
                            <Form.Text> This is meant to be a short title</Form.Text>
                            <Form.Control onChange={(e)=>setEventTitle(e.target.value)} type={"text"} placeholder={"Event Title"}/>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Event Date</Form.Label>
                            <Form.Control value={eventDate} onChange={(e)=>setEventDate(e.target.value)} type={"date"} placeholder={"Event Date"}/>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>User Who Submitted</Form.Label>
                            <Form.Control type={"text"} value={userName} disabled/>
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col}>
                            <Form.Label>Affected Categories</Form.Label>
                            <Stack direction={"horizontal"} className={"justify-content-evenly"}>
                                {Object.keys(categoryState).map((category)=>(
                                    <Form.Check
                                        key={category}
                                        type={"checkbox"}
                                        label={category}
                                        checked={categoryState[category]}
                                        onChange={()=>toggleCategory(category)}
                                    />
                                ))}
                                <Form.Check>
                                    <Stack direction={'horizontal'} className={"justify-content-evenly"}>
                                        <Form.Check.Input
                                            onChange={()=>setOtherCategory({
                                                name:otherCategory.name,
                                                checked:!otherCategory.checked
                                            })}
                                            checked={otherCategory.checked} className={""} type={"checkbox"}/>
                                        <div className="spacer" style={{margin:"0 .25rem"}}></div>
                                        <Form.Control type={"text"} placeholder={"Other"} onChange={(e)=>setOtherCategory({
                                            name:e.target.value,
                                            checked:true
                                        })}/>
                                    </Stack>
                                </Form.Check>
                            </Stack>
                        </Form.Group>
                    </Row>
                    <Row className={"my-3"}>
                        <Form.Group as={Col}>
                            <Form.Label>Event Notes</Form.Label>
                            <Form.Control onChange={(e)=>setEventNotes(e.target.value)} as={"textarea"} placeholder={"Event Notes"}/>
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