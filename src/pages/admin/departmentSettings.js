import React, {useEffect, useState} from 'react';
import {Card, Grid, Title, Text, NativeSelect, Paper, TextInput, NumberInput, Stack, Button} from "@mantine/core";
import settings from "../../json/settings.json";
import useFrequency from "../../modules/hooks/useFrequency";
import {DatePickerInput} from "@mantine/dates";
import useUsage from "../../modules/hooks/useUsage";
import {useSession} from "next-auth/react";
import useGoal from "../../modules/hooks/useGoal";
import {Notifications} from "@mantine/notifications";
import {useSetState} from "@mantine/hooks";
import useUpdates from "../../modules/hooks/useUpdates";
const {frequencies} = settings;

function SettingsCard({title,description,children,...props}){
    return (
        <Paper {...props} p={'2rem'} withBorder>
            <Stack mih={'60%'} justify={"space-between"}>
                <Stack>
                    <Title ta={'center'} mb={'xl'}>{title}</Title>
                    <Text fz={'xs'} c={'dimmed'}>
                        {description}
                    </Text>
                </Stack>
                {children}
            </Stack>
        </Paper>
    )
}

const DepartmentSettings = () => {
    const frequency = useFrequency();
    function handleNowUpdate(key,value){
        let route = key === "weeklyGoal" ? "setGoal" : "setFrequencies";
        fetch(`${window.location.origin}/api/admin/${route}`,{
            method:"POST",
            body:JSON.stringify({value})
        })
            .then((res)=>{console.log(res)});
    }
    useUsage("Admin","DepartmentSettings")
    const {data: session} = useSession();
    const [eventDate,setEventDate] = useState(new Date());

    let goal = useGoal();
    const [newGoal, setNewGoal] = useState('');
    const [displayGoal,setDisplayGoal] = useState(goal * 5);

    const currentSalesTarget = useUpdates("/api/admin/salesTarget");

    const [salesTarget,setSalesTarget] = useSetState({
        yearly:10000000,
        monthly:833333,
        weekly:185185,
        daily:26455
    })
    useEffect(() => {
        setSalesTarget(currentSalesTarget)
    },[currentSalesTarget]);

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


    function updateSalesTarget () {
        fetch(`${window.location.origin}/api/admin/salesTarget`,{
            method:"POST",
            body:JSON.stringify(salesTarget)
        })
            .then((res)=>res.json())
            .then((text) => {
                Notifications.show({title: "Success", message: text})
            })
    }


    const userName = session?.user?.name;

    return (
        <>
            <Grid>
                <Grid.Col span={4}>
                    <SettingsCard  title={"Update Frequency"} h={'100%'}>
                        <NativeSelect
                            data={frequencies}
                            value={frequency}
                            description={"This is the frequency that the data will be updated."}
                            onChange={(e)=>handleNowUpdate("frequency",e.target.value)}
                        />
                    </SettingsCard>
                </Grid.Col>
                <Grid.Col span={8}>
                    <SettingsCard title={"Weekly Goal"}>
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
                                    onChange={(e)=>setNewGoal(e)}
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
                    </SettingsCard>
                </Grid.Col>
                <Grid.Col span={8}>
                    <SettingsCard title={"Sales Target"}>
                        <Grid>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label={"Daily Target"}
                                    thousandSeparator=","
                                    prefix="$"
                                    value={salesTarget?.['daily']}
                                    onChange={(e)=>setSalesTarget({daily:e})}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label={"Weekly Target"}
                                    thousandSeparator=","
                                    prefix="$"
                                    value={salesTarget?.['weekly']}
                                    onChange={(e)=>setSalesTarget({weekly:e})}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label={"Monthly Target"}
                                    thousandSeparator=","
                                    prefix="$"
                                    value={salesTarget?.['monthly']}
                                    onChange={(e)=>setSalesTarget({monthly:e})}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label={"Yearly Target"}
                                    thousandSeparator=","
                                    prefix="$"
                                    value={salesTarget?.['yearly']}
                                    onChange={(e)=>setSalesTarget({yearly:e})}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Stack justify={"flex-end"}>
                                    <Button
                                        onClick={updateSalesTarget}
                                        size={'lg'}
                                    >Submit</Button>
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </SettingsCard>
                </Grid.Col>
            </Grid>
        </>
    );
};

export default DepartmentSettings;