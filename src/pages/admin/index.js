import React from 'react';
import Container from "react-bootstrap/Container";
import {Col, Row, Stack, Form, Button} from "react-bootstrap";
import useGoal from "../../modules/hooks/useGoal";
import settings from "../../json/settings.json";
import useFrequency from "../../modules/hooks/useFrequency";
import RoleWrapper from "../../components/RoleWrapper";
const {frequencies} = settings;







const Index = () => {
    const goal = useGoal();
    const frequency = useFrequency();

    const [userGoal, setUserGoal] = React.useState(0);
    const [userFrequency, setUserFrequency] = React.useState(frequencies[0]);

    function handleQueueUpdate(key,value){
        fetch(`${window.location.origin}/api/admin/enqueue`,{
            method:"POST",
            body:JSON.stringify({key,value,filePath:"./src/json/settings.json"})
        })
            .then((res)=>{console.log(res)});

    }
    function handleNowUpdate(key,value){
        let route = key === "weeklyGoal" ? "setGoal" : "setFrequencies";
        fetch(`${window.location.origin}/api/admin/${route}`,{
            method:"POST",
            body:JSON.stringify({value})
        })
            .then((res)=>{console.log(res)});
    }

    return (
        <RoleWrapper altRoles={"surplus director"}>
            <Container>
                <Stack>
                    <h1 className={"text-center mb-5"}>Admin Page</h1>
                    <Row direction={"horizontal"}>
                        <Col >
                            <Stack>
                                <h3 className={"text-center"}>Current Goal: {goal}</h3>
                                <Form.Label>
                                    New Goal:
                                    <Form.Control
                                        onChange={ (e)=>{ setUserGoal(+e.target.value)}}
                                        defaultValue={0}
                                        className={"text-center"}
                                        type={"number"}
                                    />
                                </Form.Label>
                                <Stack direction={"horizontal"} className={"justify-content-around mt-3"}>
                                    <Button
                                        onClick={()=>{handleNowUpdate("weeklyGoal",userGoal)}}
                                        variant={"warning"}>
                                        Update Goal Now
                                    </Button>
                                    <Button
                                        onClick={()=>{handleQueueUpdate("weeklyGoal",userGoal)}}
                                        variant={"primary"}>
                                        Queue Goal Update
                                    </Button>
                                </Stack>
                            </Stack>
                        </Col>
                        <Col md={{offset:2}}>
                            <h3 className={"text-center"} >Current frequency: {frequency}</h3>
                            <Stack>
                                <Form.Label>
                                    Update Goal:
                                    <Form.Select onChange={(e)=>{setUserFrequency(e.target.value)}}>
                                        {frequencies.map((freq) => <option key={freq} value={freq}>{freq}</option>)}
                                    </Form.Select>
                                </Form.Label>
                                <Stack direction={"horizontal"} className={"justify-content-around mt-3"}>
                                    <Button
                                        onClick={()=>handleNowUpdate("frequency",userFrequency)}
                                        variant={"warning"}>Update Frequency Now
                                    </Button>
                                    <Button
                                        onClick={()=>handleQueueUpdate("frequency",userFrequency)}
                                        variant={"primary"}>Queue Frequency Update
                                    </Button>
                                </Stack>
                            </Stack>
                        </Col>
                    </Row>
                </Stack>
            </Container>
        </RoleWrapper>
    );
};

export default Index;