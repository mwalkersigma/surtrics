import React from 'react';
import {useSession} from "next-auth/react";

import RoleWrapper from "../../components/RoleWrapper";

import {useForm} from "@mantine/form";
import {Button, Container, Grid, NativeSelect, Skeleton, Stack, Textarea, TextInput, Title} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {Notifications} from "@mantine/notifications";
import useUsage from "../../modules/hooks/useUsage";
import {useMutation, useQuery} from "@tanstack/react-query";


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


function SkeletonLoader() {
    return (
        <Container>
            <Grid>
                <Grid.Col span={12}><Title> User Skill Assessment </Title></Grid.Col>
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
    useUsage("Admin","UserAssessment")
    const {onSubmit, getInputProps} = useForm({
        initialValues: {
            user: "",
            reason: "",
            notes: "",
            date: new Date(),
            score: 0
        },
        validate:{
            user: (value) => value === "" ? "User is required" : null,
            score: (value) => value === "" ? "Score is required" : null,
            date: (value) => value === "" ? "Date is required" : null,
            notes: (value) => value === "" ? "Notes are required" : null
        }
    });

    const {data: session} = useSession();

    const {data: users, isPending: loading} = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await fetch(`/api/getUsers`);
            return res.json();
        }
    });

    const handleSubmitMutation = useMutation({
        mutationFn: handleSubmit,
        onError: (error) => {
            Notifications.show({autoClose: 5000, title: "Error", message: error, type: "error"})
        },
        onSuccess: (data) => {
            Notifications.show({autoClose: 5000, title: "Success", message: data, type: "success"})
        }
    })

    async function handleSubmit({user, reason, notes, date, score}) {
        const state = JSON.stringify({user, reason, notes, session, date, score});
        console.log("Starting submit");
        console.log("State : ", state);
        return fetch(`${window.location.origin}/api/dataEntry/skillAssessment`, {
            method: "PUT",
            body: state
        })
            .then((res) => res.text())

    }

    if (!users || !Array.isArray(users)) return <SkeletonLoader/>

    return (
        <RoleWrapper LoadingComponent={<SkeletonLoader/>} altRoles={["surplus director", "bsa","warehouse"]}>
            <Container>
                <form onSubmit={onSubmit(handleSubmitMutation.mutate)}>
                    <Grid>
                        <Grid.Col span={12}>
                            <Title>
                                User Skill Assessment
                            </Title>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NativeSelect
                                required
                                label={"User"}
                                placeholder={"Choose a user"}
                                {...getInputProps("user")}
                            >
                                <option value={""}>Choose a user</option>
                                {users.filter((user) => !ignoreList.includes(user['user_name'])).map((user) => (
                                    <option key={user["user_name"]} value={user["user_name"]}>{user["user_name"]}</option>
                                ))}
                            </NativeSelect>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label={"Score"}
                                placeholder={"Enter score"}
                                {...getInputProps("score")}
                            />
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
                                label={"User who Submitted the skill assessment"}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Stack h={"100%"} justify={"flex-end"}>
                                <Button
                                    type={'submit'}
                                    loading={loading}
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