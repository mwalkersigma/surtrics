import React, {useEffect, useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import {useSession} from "next-auth/react";
import {Notifications} from "@mantine/notifications";
import {useForm} from "@mantine/form";
import {Container, Grid, Title, TextInput, Button, Stack, Skeleton, NumberInput} from "@mantine/core";
import useUsage from "../../modules/hooks/useUsage";


function BigCommerceSkeleton() {
    return (
        <Container>
            <Grid>
                <Grid.Col span={12}><Title> Big Commerce </Title></Grid.Col>
                <Grid.Col span={4}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Stack h={"100%"} justify={"flex-end"}>
                        <Skeleton height={40}/>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    )

}

const BigCommerceEntry = () => {
    useUsage("Ecommerce","PricingBacklogEntry")
    const {data: session,status} = useSession();
    const userName = session?.user?.name;

    const [loading, setLoading] = useState(false);

    const {onSubmit, getInputProps,setValues,reset,resetDirty} = useForm({
        initialValues: {
            pricing_backlog: 0,
            user_who_submitted: userName,
            date_entered: new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        if(status === "loading"){
            setLoading(true)
        }
        if(status === "authenticated"){
            setLoading(false)
        }
        let values = {user_who_submitted: userName}
        setValues((prevValues) => ({...prevValues, ...values}));
        resetDirty(values)

    }, [status]);




    function handleSubmit(values) {
        console.log(values)
        setLoading(true)
        fetch(`${window.location.origin}/api/dataEntry/pricingBacklog`,{
            method:"PUT",
            body:JSON.stringify(values)
        })
            .then((res)=>res.json())
            .then((response)=>{
                const {message} = response;
                const error = response?.error;
                if(error){
                    Notifications.show({autoClose: 5000, title: "Error", message: error, type: "error"})
                    return;
                }
                Notifications.show({autoClose: 5000, title: "Success", message, type: "success"})
            })
            .catch((err)=>{
                Notifications.show({autoClose: 5000, title: "Error", message: err.message, type: "error"})
            })
            .finally(()=>{
                setLoading(false)
                reset()
            })
    }

    return (
        <RoleWrapper altRoles={"bsa"} LoadingComponent={<BigCommerceSkeleton/>}>
            <Container>
                <form onSubmit={onSubmit(handleSubmit)}>
                    <Grid>
                        <Grid.Col span={12}><Title> Current Pricing Backlog </Title></Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label={"Pricing Backlog count"}
                                type={"number"}
                                placeholder={"Current Pricing Backlog count"}
                                {...getInputProps("pricing_backlog")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label={"User who submitted"}
                                type={"text"}
                                disabled
                                readOnly
                                placeholder={"User who submitted"}
                                {...getInputProps("user_who_submitted")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label={"Date Submitted"}
                                type={"date"}
                                placeholder={"Date Submitted"}
                                {...getInputProps("date_entered")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Stack h={"100%"} justify={"flex-end"}>
                                <Button loading={loading} type={"submit"} variant={"primary"}>Submit</Button>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </form>
            </Container>
        </RoleWrapper>
    );
};

export default BigCommerceEntry;