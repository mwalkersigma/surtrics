import React from 'react';
import settings from "../../json/settings.json";
import RoleWrapper from "../../components/RoleWrapper";
import useUpdates from "../../modules/hooks/useUpdates";
import {TableSort} from "../../components/mantine/TableSort";
import useTable from "../../modules/hooks/useTable";
import {Container, Group, TagsInput, TextInput, Title, Button, Stack, Divider, Space} from "@mantine/core";
import {useForm} from "@mantine/form";
import {Notifications} from "@mantine/notifications";

const {frequencies} = settings;

//---------
// create user
// add role
// remove role
// remove user
//-------------

// update goal
// update frequency
// create Errors
// update Errors
// delete Errors

export default function AdminPanel() {
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
    )
}


// const Index = () => {
//     const frequency = useFrequency();
//     const [userFrequency, setUserFrequency] = React.useState(frequencies[0]);
//
//     function handleQueueUpdate(key,value){
//         fetch(`${window.location.origin}/api/admin/enqueue`,{
//             method:"POST",
//             body:JSON.stringify({key,value,filePath:"./src/json/settings.json"})
//         })
//             .then((res)=>{console.log(res)});
//
//     }
//     function handleNowUpdate(key,value){
//         let route = key === "weeklyGoal" ? "setGoal" : "setFrequencies";
//         fetch(`${window.location.origin}/api/admin/${route}`,{
//             method:"POST",
//             body:JSON.stringify({value})
//         })
//             .then((res)=>{console.log(res)});
//     }
//
//     return (
//         <RoleWrapper altRoles={"surplus director"}>
//             <Container>
//                 <Stack>
//                     <h1 className={"text-center mb-5"}>Admin Page</h1>
//                     <Row direction={"horizontal"}>
//                         <Col md={{offset:4 , span:4}}>
//                             <h3 className={"text-center"} >Current frequency: {frequency}</h3>
//                             <Stack>
//                                 <Form.Label>
//                                     Update Goal:
//                                     <Form.Select onChange={(e)=>{setUserFrequency(e.target.value)}}>
//                                         {frequencies.map((freq) => <option key={freq} value={freq}>{freq}</option>)}
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <Stack direction={"horizontal"} className={"justify-content-around mt-3"}>
//                                     <Button
//                                         onClick={()=>handleNowUpdate("frequency",userFrequency)}
//                                         variant={"warning"}>Update Frequency Now
//                                     </Button>
//                                     <Button
//                                         onClick={()=>handleQueueUpdate("frequency",userFrequency)}
//                                         variant={"primary"}>Queue Frequency Update
//                                     </Button>
//                                 </Stack>
//                             </Stack>
//                         </Col>
//                     </Row>
//                 </Stack>
//             </Container>
//         </RoleWrapper>
//     );
// };
//
// export default Index;