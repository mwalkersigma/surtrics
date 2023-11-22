import React from 'react';
import {Button, Grid, NativeSelect, Stack, Textarea, TextInput, Title} from "@mantine/core";
import {useForm} from "@mantine/form";
import {Notifications} from "@mantine/notifications";

const CreateErrorType = () => {
    const assignedValues = {
        "Total Output": "Error/(incrementations+Approvals)",
        "Incrementation": "Error/Approvals",
        "Approvals": "Error/Incrementations",
    }
    const form = useForm({
        initialValues: {
            name: "",
            definition: "",
            assigned: ""
        },
    });

    function handleSubmit(values) {
        fetch('/api/admin/error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then((r) => r.json())
            .then((data) => {
                Notifications.show({autoClose: 5000, title: "Success", message: data, type: "success"})
            });
    }
    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid mb={'md'}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={10}>
                    <Title order={3}>Errors</Title>
                </Grid.Col>
                <Grid.Col span={1}></Grid.Col>

                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={5}>
                    <TextInput
                        label={'Name'}
                        placeholder={'Name'}
                        {...form.getInputProps('name')}
                    />
                </Grid.Col>
                <Grid.Col span={5}>
                    <NativeSelect
                        label={'Assigned'}
                        placeholder={'Assigned'}
                        {...form.getInputProps('assigned')}
                    >
                        {Object.keys(assignedValues).map((key) => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </NativeSelect>
                </Grid.Col>
                <Grid.Col span={1}></Grid.Col>

                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={10}>
                    <Textarea
                        label={'Definition'}
                        placeholder={'Definition'}
                        {...form.getInputProps('definition')}
                    />
                </Grid.Col>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={2}>
                    <Stack h={"100%"} justify={"flex-end"}>
                        <Button
                            variant="filled"
                            color="blue"
                            type={"submit"}
                        >
                            Add
                        </Button>
                    </Stack>
                </Grid.Col>
            </Grid>
        </form>
    );
};

export default CreateErrorType;