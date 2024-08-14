import React, {useState} from 'react';
import {
    Button,
    CloseButton,
    Container,
    Flex,
    Grid,
    Group,
    LoadingOverlay,
    NativeSelect,
    NumberInput,
    Paper,
    ScrollArea,
    Text,
    Textarea,
    TextInput,
    Title
} from "@mantine/core";
import {useSetState} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {DatePickerInput} from "@mantine/dates";
import {useMutation, useQuery} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import useUsage from "../../modules/hooks/useUsage";

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

function ErrorCard({id, user, location, reason, notes, handleRemove}) {
    return (
        <Paper withBorder p={'1rem'} mb={'1rem'}>
            <Group mb={'md'} w={'100%'} justify={'space-between'}>
                <Title order={4}>{reason}</Title>
                <CloseButton onClick={() => handleRemove(id)}/>
            </Group>
            <Text mb={'md'} fz={'sm'} c={'dimmed'}>
                {notes}
            </Text>
            <Group w={'100%'} align={'flex-end'} justify={'space-between'}>
                <Text>User: <Text span fz={'sm'} c={'dimmed'}> {user} </Text></Text>
                <Text>Location:<Text span fz={'sm'} c={'dimmed'}> {location} </Text></Text>
            </Group>
        </Paper>
    )
}

function AuditForm({auditFormState}) {
    const {toteQuantity, quantityIncorrect} = auditFormState.values;
    const percentCorrect = Math.trunc((toteQuantity > 0 ? ((toteQuantity - quantityIncorrect) / toteQuantity) * 100 : 0) * 100) / 100;
    return (
        <>
            <Grid.Col span={6}>
                <DatePickerInput
                    label="Audit Date"
                    placeholder="Enter audit date"
                    description="The date of the audit"
                    {...auditFormState.getInputProps('auditDate')}
                    required
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput
                    label="Tote ID"
                    placeholder="Enter tote ID"
                    description="If you have a scanner attached, you can scan the tote ID"
                    {...auditFormState.getInputProps('toteID')}
                    required
                />
            </Grid.Col>
            <Grid.Col mb={'md'} span={4}>
                <NumberInput
                    label="Tote Quantity"
                    placeholder="Enter tote quantity"
                    {...auditFormState.getInputProps('toteQuantity')}
                    required
                />
            </Grid.Col>
            <Grid.Col span={4}>
                <NumberInput
                    label="Quantity Incorrect"
                    placeholder="Enter quantity incorrect"
                    {...auditFormState.getInputProps('quantityIncorrect')}
                    required
                />
            </Grid.Col>
            <Grid.Col span={4}>
                <NumberInput
                    label="Percent Correct"
                    placeholder="This is the percent correct for the tote"
                    hideControls
                    value={percentCorrect}
                    rightSection={"%"}
                    disabled
                    required
                />
            </Grid.Col>
        </>
    )
}

function ErrorEntryForm({handleSave}) {
    const [error, setError] = useSetState({
        user: '',
        reason: '',
        location: '',
        notes: ''
    });
    const {data: users, isPending: loadingUsers} = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            return await fetch("/api/getUsers")
                .then(res => res.json())
        }
    });
    const {data: errorTypes, isPending: loadingErrors} = useQuery({
        queryKey: ['errors'],
        queryFn: async () => {
            return await fetch("/api/admin/error")
                .then(res => res.json())
        }
    });
    return (
        <Paper pos={'relative'} mb={'lg'} withBorder p={'1rem'}>
            <LoadingOverlay visible={loadingUsers || loadingErrors} zIndex={1000}
                            overlayProps={{radius: "sm", blur: 2}}/>
            <Title order={2} mb={'1rem'}>
                Error Submission
            </Title>
            <Grid>
                <Grid.Col span={12}>
                    <NativeSelect
                        withAsterisk
                        label={"User"}
                        placeholder={"Choose a user"}
                        value={error.user}
                        onChange={(event) => setError({user: event.currentTarget.value})}
                    >
                        <option value={""}>Choose a user</option>
                        {!loadingUsers && users.filter((user) => !ignoreList.includes(user['user_name'])).map((user) => (
                            <option key={user["user_name"]} value={user["user_name"]}>{user["user_name"]}</option>
                        ))}
                    </NativeSelect>

                </Grid.Col>
                <Grid.Col span={12}>
                    <NativeSelect
                        withAsterisk
                        label={"location"}
                        placeholder={"Enter location"}
                        value={error.location}
                        onChange={(event) => setError({location: event.currentTarget.value})}
                    >
                        <option value={""}>Choose a location</option>
                        <option value={"Audit"}>Audit</option>
                        <option value={"Shipping"}>Shipping</option>
                        <option value={"Cycle Count"}>Cycle Count</option>
                    </NativeSelect>
                </Grid.Col>
                <Grid.Col span={12}>
                    <NativeSelect
                        withAsterisk
                        label={"Reason"}
                        placeholder={"Choose a reason"}
                        value={error.reason}
                        onChange={(event) => setError({reason: event.currentTarget.value})}
                    >
                        <option value={""}>Choose a reason</option>
                        {!loadingErrors && errorTypes.map(error => {
                            return <option key={error.name} value={error.name}>{error.name}</option>
                        })}
                    </NativeSelect>

                </Grid.Col>
                <Grid.Col span={12}>
                    <Textarea
                        label="Notes"
                        placeholder="Enter notes"
                        value={error.notes}
                        onChange={(event) => setError({notes: event.currentTarget.value})}
                        autosize
                        minRows={3}
                    />
                </Grid.Col>
                <Grid.Col span={8}></Grid.Col>
                <Grid.Col span={4}>
                    <Button onClick={() => {
                        if (!error.user || !error.reason || !error.location || !error.notes) {
                            notifications.show({
                                title: 'Error',
                                message: 'Please fill out all fields for error',
                                color: 'red'
                            })
                            return;
                        }
                        handleSave({...error, id: Math.random()})
                        setError({
                            user: '',
                            reason: '',
                            location: '',
                            notes: ''
                        })
                    }} fullWidth>Add to audit</Button>
                </Grid.Col>
            </Grid>
        </Paper>
    )
}

function ErrorCardHolder({errors}) {
    return (
        <Paper mah={560} withBorder p={'1rem'}>
            <Title order={2} mb={'xl'} ta={'center'}>Errors</Title>
            <ScrollArea type={'auto'} h={450}>
                {errors.map((error, index) => <ErrorCard key={index} {...error}
                                                         handleRemove={(id) => setErrors(errors.filter(e => e.id !== id))}/>)}
            </ScrollArea>
        </Paper>
    )
}

async function submitQualityAudit(values) {
    console.log(values)
    if (!confirm("Are you ready to submit ?")) {
        notifications.show({title: 'Cancelled', message: 'Audit submission cancelled', color: 'red'})
        return;
    }
    if (values.quantityIncorrect === 0 && !confirm("Are you sure the quantity incorrect is 0 ?")) {
        notifications.show({title: 'Cancelled', message: 'Audit submission cancelled', color: 'red'})
        return;
    }
    if (values.quantityIncorrect > values.toteQuantity) {
        notifications.show({
            title: 'Error',
            message: 'Quantity incorrect cannot be greater than tote quantity',
            color: 'red'
        })
        return;
    }
    if (values.errors.length === 0 && !confirm("Are you sure you want to submit with no errors ?")) {
        notifications.show({title: 'Cancelled', message: 'Audit submission cancelled', color: 'red'})
        return;
    }
    const response = await fetch('/api/dataEntry/audit', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
    })

    if (!response.ok) {
        const responseMessage = await response.json();
        notifications.show({
            title: 'Error',
            message: 'Error submitting audit' + "\n" + `${JSON.stringify(responseMessage)}`,
            color: 'red'
        })
        return;
    }

    notifications.show({title: 'Success', message: 'Audit submitted successfully', color: 'green'})
    return response.json();

}

const QualityAudits = () => {
    useUsage("Admin", "QualityAudits")
    const [errors, setErrors] = useState([]);
    const auditForm = useForm({
        initialValues: {
            auditDate: new Date(),
            toteID: '',
            toteQuantity: null,
            quantityIncorrect: null
        }
    });

    const addAuditMutation = useMutation({
        mutationFn: (values) => submitQualityAudit(...values, errors),
        onSuccess: () => auditForm.reset(),
    })


    return (
        <Container size={'responsive'}>
            <Title order={1} ta={'center'} mb={'xl'}>
                Tote Audit Entry
            </Title>
            <form onSubmit={auditForm.onSubmit(addAuditMutation.mutate)}>
                <Grid>
                    <AuditForm auditFormState={auditForm}/>
                    <Grid.Col h={550} span={12}>
                        <Grid h={'100%'}>
                            <Grid.Col span={6}>
                                <ErrorCardHolder errors={errors}/>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Flex h={'100%'} direction={'column'} justify={'space-between'}>
                                    <ErrorEntryForm handleSave={(value) => setErrors([...errors, value])}/>
                                    <Button type={'submit'} fullWidth mt={'1rem'}>Submit Audit</Button>
                                </Flex>
                            </Grid.Col>
                        </Grid>
                    </Grid.Col>

                </Grid>

            </form>
        </Container>
    );
};

export default QualityAudits;