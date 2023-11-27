import React, {useEffect, useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import {useSession} from "next-auth/react";
import {Notifications} from "@mantine/notifications";
import {useForm} from "@mantine/form";
import {Container, Grid, Title, TextInput, Button, Stack, Skeleton, NumberInput} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";


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
    const {data: session,status} = useSession();
    const userName = session?.user?.name;
    const [loading, setLoading] = useState(true);
    const {onSubmit, getInputProps,setValues,resetDirty,reset,values} = useForm({
        initialValues: {
            visits: 0,
            shopped: 0,
            add_to_cart: 0,
            web_leads: 0,
            date_for_week: new Date(),
            user_who_submitted: userName || "",
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
        fetch(`${window.location.origin}/api/dataEntry/bigCommerce`,{
            method:"PUT",
            body:JSON.stringify(values)
        })
            .then((res)=>res.json())
            .then(({message})=>{
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
                        <Grid.Col span={12}><Title> Big Commerce </Title></Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label={"Visits"}
                                type={"number"}
                                placeholder={"Visits"}
                                {...getInputProps("visits")}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label={"Shopped"}
                                type={"number"}
                                placeholder={"Shopped"}
                                {...getInputProps("shopped")}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label={"Add to Cart"}
                                type={"number"}
                                placeholder={"Add to Cart"}
                                {...getInputProps("add_to_cart")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label={"Web Leads"}
                                type={"number"}
                                placeholder={"Web Leads"}
                                {...getInputProps("web_leads")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DatePickerInput
                                label={"For Week of"}
                                {...getInputProps("date_for_week")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label={"User Who Submitted"}
                                type={"text"}
                                disabled
                                readOnly
                                placeholder={values.user_who_submitted}
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