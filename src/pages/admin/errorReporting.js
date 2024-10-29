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
    useUsage("Admin","ErrorReporting")
    const {onSubmit, getInputProps} = useForm({
        initialValues: {
            user: "",
            reason: "",
            notes: "",
            date: new Date(),
            location: ""
        },
        validate: {
            user: (value) => (value ? null : 'User is required'),
            reason: (value) => (value ? null : 'Reason is required'),
            date: (value) => (value ? null : 'Date is required'),
        }
    });
    const {data: session} = useSession();

    const {data: users, isPending: loadingUsers} = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            return await fetch("/api/getUsers")
                .then(res => res.json())
        }
    });
    const {data: errorTypes, isPending: loadingErrorTypes} = useQuery({
        queryKey: ['errors'],
        queryFn: async () => {
            return await fetch("/api/admin/error")
                .then(res => res.json())
        }
    });


    const handleErrorMutation = useMutation({
        mutationFn: (values) => {
            return fetch('/api/dataEntry/error', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })
                .then((r) => r.text())
        },
        onSuccess: (data) => {
            Notifications.show({autoClose: 5000, title: "Success", message: data, type: "success"})
        },
        onError: (err) => {
            Notifications.show({autoClose: 5000, title: "Error", message: err, type: "error"})
        }
    })


    const isLoading = loadingUsers || loadingErrorTypes;


    return (
        <RoleWrapper LoadingComponent={<SkeletonLoader/>} altRoles={["surplus director", "bsa","warehouse"]}>
            {isLoading && <SkeletonLoader/>}
            {!isLoading && (
                <Container>
                    <form onSubmit={onSubmit(handleErrorMutation.mutate)}>
                        <Grid>
                            <Grid.Col span={12}><Title> Error Reporting </Title></Grid.Col>
                            <Grid.Col span={3}>
                                <NativeSelect
                                    required
                                    label={"User"}
                                    placeholder={"Choose a user"}
                                    {...getInputProps("user")}
                                >
                                    <option value={""}>Choose a user</option>
                                    {users.filter((user) => !ignoreList.includes(user['user_name'])).map((user) => (
                                        <option key={user["user_name"]}
                                                value={user["user_name"]}>{user["user_name"]}</option>
                                    ))}
                                </NativeSelect>
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NativeSelect
                                    required
                                    label={"Reason"}
                                    placeholder={"Choose a reason"}
                                    {...getInputProps("reason")}
                                >
                                    <option value={""}>Choose a reason</option>
                                    {...errorTypes.map(error => {
                                        return <option key={error.name} value={error.name}>{error.name}</option>
                                    })}
                                </NativeSelect>
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NativeSelect
                                    label={"location"}
                                    placeholder={"Enter location"}
                                    {...getInputProps("location")}
                                >
                                    <option value={""}>Choose a location</option>
                                    <option value={"Audit"}>Audit</option>
                                    <option value={"Shipping"}>Shipping</option>
                                    <option value={"Cycle Count"}>Cycle Count</option>
                                </NativeSelect>
                            </Grid.Col>
                            <Grid.Col span={3}>
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
                                        disabled={isLoading}
                                        loading={isLoading}
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
            )}
        </RoleWrapper>
    )
};

export default ErrorReporting;