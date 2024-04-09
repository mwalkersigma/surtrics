import React, {useEffect, useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";

import {useSession} from "next-auth/react";
import {useForm} from "@mantine/form";
import {Notifications} from "@mantine/notifications";
import {Button, Container, Grid, NumberInput, Stack, TextInput, Title} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import useUsage from "../../modules/hooks/useUsage";


const EbayEntry = () => {
    useUsage("Ecommerce","EbayDefectEntry")
    const {data: session,status} = useSession();
    const userName = session?.user?.name;

    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            defectRate:0,
            date_for_week: new Date(),
            user_who_submitted: "",
        }
    })

    useEffect(() => {
        if(status === "loading"){
            setLoading(true)
        }
        if(status === "authenticated"){
            setLoading(false)
        }
        let values = {user_who_submitted: userName}
        form.setValues((prevValues) => ({...prevValues, ...values}));
        form.resetDirty(values)

    }, [status]);

    function handleSubmit(values) {
        setLoading(true)
        fetch(`${window.location.origin}/api/dataEntry/ebayDefectRate`, {
            method: "PUT",
            body: JSON.stringify(values)
        })
            .then((res) => res.json())
            .then(({message, response}) => {
                Notifications.show({autoClose: 5000, title: "Success", message, type: "success"})
            })
            .catch((err) => {
                Notifications.show({autoClose: 5000, title: "Error", message: err.message, type: "error"})
            })
            .finally(() => {
                setLoading(false)
                form.reset()
            })
    }
    return (
        <RoleWrapper altRoles={"bsa"}>
            <Container>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Grid>
                        <Grid.Col span={12}>
                            <Title> Ebay Defect Entry </Title>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label={"Defect Rate"}
                                {...form.getInputProps("defectRate")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DatePickerInput
                                label={"Date"}
                                {...form.getInputProps("date_for_week")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label={"Who Submitted"}
                                disabled
                                readOnly
                                placeholder={form.values.user_who_submitted}
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

export default EbayEntry;