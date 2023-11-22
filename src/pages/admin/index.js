import React from 'react';
import settings from "../../json/settings.json";
import RoleWrapper from "../../components/RoleWrapper";
import {
    Container,
    Title,
    Stack,
    Grid,
    NativeSelect
} from "@mantine/core";
import useFrequency from "../../modules/hooks/useFrequency";
const {frequencies} = settings;



// update goal
// create Errors
// update Errors
// delete Errors





const Index = () => {
    const frequency = useFrequency();
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
                    <Title className={"text-center mb-5"}>Admin Page</Title>
                    <Grid>
                        <Grid.Col span={4}>
                            <NativeSelect
                                label={"Update Frequency"}
                                description={"This is the frequency that the data will be updated"}
                                onChange={(e)=>handleNowUpdate("frequency",e.target.value)}
                                data={frequencies}
                                value={frequency}
                            />
                        </Grid.Col>
                    </Grid>
                </Stack>
            </Container>
        </RoleWrapper>
    );
};

export default Index;