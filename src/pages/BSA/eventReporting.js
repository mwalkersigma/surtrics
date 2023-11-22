 import React, {useEffect, useState} from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import {useSession} from "next-auth/react";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import {Notifications} from "@mantine/notifications";
import {Button, Container, Grid, Stack, TagsInput, Textarea, TextInput, Title, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {DatePickerInput} from "@mantine/dates";


/*
<TagsInput
                label={"Affected Categories"}
                description={"Select All that apply or add your own"}
                data={[
                    "Marketing",
                    "Processing",
                    "Website",
                    "Warehouse",
                    "Pricing"
                ]}
                {...form.getInputProps("affected_categories")}
    />
 */


const EventReporting = () => {
    const {data: session, status} = useSession();
    const userName = session?.user?.name;
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            event_name: "",
            event_date: new Date(),
            event_notes: "",
            affected_categories: [],
            user_who_submitted: "",
            session
        }
    })
    console.log(form.getInputProps("affected_categories"))

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
        fetch(`${window.location.origin}/api/admin/event`, {
            method: "PUT",
            body: JSON.stringify(values)
        })
            .then((res) => res.json())
            .then(({message}) => {
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
        <RoleWrapper altRoles={["bsa", "surplus director"]}>
            <Container>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Grid>
                        <Grid.Col span={12}>
                            <Title> Event Reporting </Title>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label={"Event Name"}
                                placeholder={"Name"}
                                {...form.getInputProps("event_name")}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <DatePickerInput
                                label={"Event Date"}
                                placeholder={"Date"}
                                {...form.getInputProps("event_date")}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label={"User Who Submitted"}
                                placeholder={form.values.user_who_submitted}
                                disabled
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label={"Event Notes"}
                                placeholder={"Notes"}
                                {...form.getInputProps("event_notes")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Tooltip
                                label={"You can type your own custom labels, simply press enter when done typing"}
                                position="top"
                                offset={11}
                            >
                                <TagsInput
                                    label={"Affected Categories"}
                                    description={"Select All that apply"}
                                    placeholder={"Affected Categories"}
                                    data={[
                                        "Marketing",
                                        "Processing",
                                        "Website",
                                        "Warehouse",
                                        "Pricing"
                                    ]}
                                    {...form.getInputProps("affected_categories")}
                                />
                            </Tooltip>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Stack h={"100%"} justify={"flex-end"}>
                                <Button
                                    loading={loading}
                                    type={"submit"}
                                    variant={"primary"}
                                >
                                    Submit
                                </Button>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </form>
            </Container>
        </RoleWrapper>
    )
};

export default EventReporting;