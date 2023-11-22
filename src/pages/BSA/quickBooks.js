import React, {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import {Notifications} from "@mantine/notifications";
import {useForm} from "@mantine/form";
import {Button, Container, Grid, NativeSelect, NumberInput, Stack, TextInput, Title} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";

const QuickBooks = () => {
    const {data: session, status} = useSession();
    const userName = session?.user?.name;
    const [loading, setLoading] = useState(true);

    const form = useForm({
        initialValues: {
            customer_name: "",
            po_number: "",
            date_of_sale: new Date(),
            purchase_type: "",
            total_amount: 0,
            user_who_submitted: userName || "",
        }
    });

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


    function handleSubmit (values) {
        fetch(`${window.location.origin}/api/dataEntry/quickBooks`,{
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
                form.reset()
            })
    }

    return (
        <Container>
            <form>
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
                        <DatePickerInput
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
                                <option value={"N/A"} >N/A</option>
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
        </Container>
    );
};

export default QuickBooks;