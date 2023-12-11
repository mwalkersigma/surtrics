import React from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import {TableSort} from "../../components/mantine/TableSort";
import useTable from "../../modules/hooks/useTable";
import {useForm} from "@mantine/form";
import {Container, Group, TagsInput, TextInput, Title, Button, Stack, Divider, Space} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import useUsage from "../../modules/hooks/useUsage";




export default function AdminPanel() {
    useUsage("Admin","AdminPanel")
    const {tableData, removeHandler, putHandler, status, handlers} = useTable({
        route: "/api/admin/user",
        idField: "email"
    })
    const form = useForm({
        initialValues: {
            name: "",
            email: "",
            roles: []
        },
    })
    const roles = tableData
        .map(row => row.roles)
        .flat()
        .filter((role, index, array) => array.indexOf(role) === index)
        .filter(role => role);


    const updateRoles = (email, roles) => {
        putHandler("/api/admin/user")(tableData.map((row) => {
            if (row.email === email) {
                row.roles = roles;
            }
            return row;
        }))
            .then(res => res.json())
            .then(console.log)
    }


    const removeUser = removeHandler("/api/admin/user")

    let users = tableData
        .map(row => ({
            id: row.email,
            name: row.name,
            roles: <TagsInput
                data={roles}
                value={row.roles}
                w={"100%"}
                onChange={(value) => updateRoles(row.email, value)}
            />,
            controls: <Group>
                <Button
                    variant="filled"
                    color="red"
                    onClick={() => removeUser(row.email)}
                >
                    Remove
                </Button>
            </Group>

        }))

    return (
        <RoleWrapper>
            <Container>
                <Title order={1} ta={'center'} mb={'md'}>Admin Panel ( User ) </Title>
                <Divider/>
                <Space h={"2rem"}/>
                <Title order={2} mb={'md'}>Add User</Title>
                <form onSubmit={form.onSubmit((values) => {
                    let email = values.email;
                    let emails = tableData.map((user) => user.email);
                    if (emails.includes(email)) {
                        return Notifications.show({title: "Error", message: "User already exists"})
                    }
                    putHandler("/api/admin/user")([...tableData, values])
                        .then(res => res.json())
                        .then(console.log)
                })}>
                    <Group mb={'md'} align={'flex-end'}>

                        <TextInput
                            label="Name"
                            placeholder="User's name"
                            required
                            variant="filled"
                            size="sm"
                            {...form.getInputProps("name")}
                        />
                        <TextInput
                            label="Email"
                            placeholder="User's email"
                            required
                            variant="filled"
                            size="sm"
                            {...form.getInputProps("email")}
                        />
                        <TagsInput
                            label="Roles"
                            data={roles}
                            {...form.getInputProps("roles")}
                        />
                        <Stack h={"100%"} style={{justifyContent: "flex-end"}} justify={"flex-end"}>
                            <Button type={"submit"} variant={"primary"}>Submit</Button>
                        </Stack>
                    </Group>
                </form>
                <Space h={"1rem"}/>
                <Divider/>
                <Space h={"2rem"}/>
                <Title order={2} mb={'md'}>Users</Title>
                {users.length > 0 && <TableSort noToolTip={["roles", "controls"]} data={users}/>}
            </Container>
        </RoleWrapper>
    )
}
