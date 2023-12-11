import React, {useEffect, useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import {useSession} from "next-auth/react";
import useGoal from "../../modules/hooks/useGoal";
import {Notifications} from "@mantine/notifications";
import {Container, Grid, NumberInput, TextInput, Title, Button, Stack} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import useUsage from "../../modules/hooks/useUsage";

const UpdateGoal = () => {
    useUsage("Admin","UpdateGoal")
    const {data: session} = useSession();
    const [eventDate,setEventDate] = useState(new Date());
    let goal = useGoal();
    const [newGoal, setNewGoal] = useState('');
    const [displayGoal,setDisplayGoal] = useState(goal * 5);
    useEffect(() => {
        setDisplayGoal(goal * 5)
    }, [goal,newGoal]);

    function handleSubmit () {
        if(!newGoal) return;
        if(!newGoal > 0) return;
        const event = {
            goal_date:eventDate,
            goal_amount:newGoal,
            user_who_submitted:userName,
            session
        }
        fetch(`${window.location.origin}/api/admin/goal`,{
            method:"PUT",
            body:JSON.stringify(event)
        })
        .then((res)=>res.text())
        .then((text) => {
            Notifications.show({title: "Success", message: text})
            setDisplayGoal(newGoal)
        })
    }


    const userName = session?.user?.name;
    return (
        <RoleWrapper altRoles={["surplus director"]}>
            <Container>
                <Title className={"text-center my-5"}>Update Goal</Title>
                <form>
                    <Grid>
                        <Grid.Col span={6}>
                            <DatePickerInput
                                label={"Date Of Change"}
                                value={eventDate}
                                onChange={(e)=>setEventDate(e.target.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label={"User Who Submitted"}
                                placeholder={userName}
                                disabled
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label={"Goal Amount"}
                                placeholder={displayGoal}
                                value={newGoal}
                                onChange={(e)=>setNewGoal(e.target.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label={"Current Goal"}
                                placeholder={displayGoal}
                                value={displayGoal}
                                disabled
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Stack justify={"flex-end"}>
                                <Button
                                    onClick={handleSubmit}
                                    size={'lg'}
                                >Submit</Button>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </form>
            </Container>
        </RoleWrapper>
    );
};

export default UpdateGoal;