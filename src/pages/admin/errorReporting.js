import React, {useEffect, useState} from 'react';


import {useSession} from "next-auth/react";

import RoleWrapper from "../../components/RoleWrapper";

import {useForm} from "@mantine/form";
import {Grid, Container, NativeSelect, Title, TextInput, Textarea, Button, Text, Stack, Skeleton} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {Notifications} from "@mantine/notifications";

const ignoreList = [
    "BSA",
    "mbittner",
    "Receiving Errors 1",
    "Receiving Station 1",
    "Receiving Station 2",
    "Receiving Station 3",
    "SkuVault Support",
    "System",
    "Testing Shared Account"
]

function validate(state) {
    const {user, reason, notes} = state;
    const noteLength = notes.length;
    return !(!user || !reason || noteLength > 255);
}

function SkeletonLoader() {
    return (
        <Container>
            <Grid>
                <Grid.Col span={12}><Title> Error Reporting </Title></Grid.Col>
                <Grid.Col span={4}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Skeleton height={40}/>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Skeleton height={160}/>
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


const ErrorReporting = () => {
    const {onSubmit, getInputProps} = useForm({
        initialValues: {
            user: "",
            reason: "",
            notes: "",
            date: new Date(),
        },
        validate: {
            user: (value) => (value ? null : 'User is required'),
            reason: (value) => (value ? null : 'Reason is required'),
            date: (value) => (value ? null : 'Date is required'),
        }
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const {data: session, status} = useSession();


    useEffect(() => {
        fetch(`${window.location.origin}/api/getUsers`)
            .then((res) => res.json())
            .then((res) => setUsers(res))
            .catch((err) => console.log(err))
    }, []);

    function handleSubmit({user, reason, notes, date}) {
        const state = JSON.stringify({user, reason, notes, session, date});
        setLoading(true);
        fetch(`${window.location.origin}/api/admin/error`, {
            method: "PUT",
            body: state
        })
            .then((res) => res.text())
            .then((res) => {
                Notifications.show({autoClose:5000, title: "Success", message: res, type: "success"})
            })
            .catch((err) => {
                Notifications.show({autoClose:5000, title: "Error", message: err, type: "error"})
            })
            .finally(() => {
                setLoading(false);
            })
    }

    return (
        <RoleWrapper LoadingComponent={<SkeletonLoader/>} altRoles={["surplus director", "bsa"]}>
            <Container>
                <form onSubmit={onSubmit(handleSubmit)}>
                    <Grid>
                        <Grid.Col span={12}><Title> Error Reporting </Title></Grid.Col>
                        <Grid.Col span={4}>
                            <NativeSelect
                                required
                                label={"User"}
                                placeholder={"Choose a user"}
                                {...getInputProps("user")}
                            >
                                <option value={""}>Choose a user</option>
                                {users.filter((user) => !ignoreList.includes(user.user_name)).map((user) => (
                                    <option key={user.user_name} value={user.user_name}>{user.user_name}</option>
                                ))}
                            </NativeSelect>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NativeSelect
                                required
                                label={"Reason"}
                                placeholder={"Choose a reason"}
                                {...getInputProps("reason")}
                            >
                                <option value={""}>Choose a reason</option>
                                <option value={"no photo"}>No Photo</option>
                                <option value={"not approved"}>Not Approved</option>
                                <option value={"wrong label"}>Wrong Label</option>
                                <option value={"no location"}>No Location</option>
                                <option value={"Typo"}> Typo</option>
                                <option value={"listing Error"}> Listing Error</option>
                                <option value={"Wrong Condition"}> Wrong Condition</option>
                                <option value={"Mixed Bag"}> Mixed Bag</option>
                            </NativeSelect>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <DatePickerInput
                                required
                                label={"Date"}
                                placeholder={"Choose a date"}
                                {...getInputProps("date")}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                required
                                autosize
                                minRows={3}
                                label={"Notes"}
                                placeholder={"Enter notes"}
                                {...getInputProps("notes")}
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <TextInput
                                defaultValue={session?.user?.email}
                                disabled
                                label={"User who reported error"}
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Stack h={"100%"} justify={"flex-end"}>
                                <Button
                                    type={"submit"}
                                    disabled={loading}
                                    variant="gradient"
                                    gradient={{from: 'red', to: 'grape', deg: 90}}
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

export default ErrorReporting;