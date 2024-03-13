import React, {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import {Notifications} from "@mantine/notifications";
import {useForm} from "@mantine/form";
import {
    Button,
    Container,
    Divider, FileInput,
    Grid,
    NativeSelect,
    NumberInput,
    Space,
    Stack,
    TextInput,
    Title
} from "@mantine/core";
import {DateInput} from "@mantine/dates";
import useUsage from "../../modules/hooks/useUsage";

const QuickBooks = () => {

    useUsage("Ecommerce", "QuickBooksEntry")
    const {data: session, status} = useSession();
    const userName = session?.user?.name;
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);

    const form = useForm({
        initialValues: {
            customer_name: "",
            po_number: "",
            date_of_sale: new Date(),
            purchase_type: "",
            total_amount: 0,
            user_who_submitted: userName || "",
        },
        validate : {
            customer_name: (value) => {
                if (!value) {
                    return "Customer name is required"
                }
            },
            po_number: (value) => {
                if (!value) {
                    return "PO number is required"
                }
            },
            date_of_sale: (value) => {
                if (!value) {
                    return "Date is required"
                }
            },
            purchase_type: (value) => {
                if (!value) {
                    return "Purchase type is required"
                }
            },
            total_amount: (value) => {
                if (!value) {
                    return "Total amount is required"
                }
            },
        }
    });

    useEffect(() => {
        if (status === "loading") {
            setLoading(true)
        }
        if (status === "authenticated") {
            setLoading(false)
        }
        let values = {user_who_submitted: userName}
        form.setValues((prevValues) => ({...prevValues, ...values}));
        form.resetDirty(values)

    }, [status]);


    function handleSubmit(values) {
        fetch(`${window.location.origin}/api/dataEntry/quickBooks`, {
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

    function handleFileSubmit(file) {
        let csv = new FormData();
        csv.append("file", file);
        setLoading(true)

        fetch(`${window.location.origin}/api/dataEntry/quickBooks`, {
            method: "POST",
            body: csv
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
        <Container>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid>
                    <Grid.Col span={12}>
                        <Title>Quick Books</Title>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput
                            label={"Customer Name"}
                            placeholder={"Name"}
                            {...form.getInputProps("customer_name")}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput
                            label={"PO Number"}
                            placeholder={"PO Number"}
                            {...form.getInputProps("po_number")}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <DateInput
                            label={"Date"}
                            {...form.getInputProps("date_of_sale")}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NumberInput
                            label={"Total Amount"}
                            prefix={"$"}
                            {...form.getInputProps("total_amount")}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NativeSelect label={"Purchase Type"}{...form.getInputProps("purchase_type")}>
                            <option>----------------- Select option ------------------</option>
                            <option value={"auction"}>Auction</option>
                            <option value={"no_list"}>Non-List</option>
                            <option value={"targeted"}>List Buy</option>
                            <option value={"targeted"}>Sourcing</option>
                            <option value={"N/A"}>N/A</option>
                        </NativeSelect>
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
            <Space h={"2.4rem"}/>
            <Divider variant={"dashed"} label="File Upload" labelPosition="center"/>
            <Space h={"2.4rem"}/>
            <FileInput
                onChange={setFile}
                value={file}
                label="Upload files"
                placeholder="Upload files"
            />
            <Space h={"2.4rem"}/>
            <Button
                onClick={() => handleFileSubmit(file)}
                loading={loading}
                type={"submit"}
                variant={"primary"}
                disabled={!file}
            >
                Submit
            </Button>
        </Container>
    );
};

export default QuickBooks;