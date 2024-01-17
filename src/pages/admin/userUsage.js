import React from 'react';
import {Avatar, Badge, Table, Group, Text, Progress, Tooltip, Pill, Modal, Button, Timeline} from '@mantine/core';
import classes from "../../styles/NavbarNested.module.css";
import {useDisclosure} from "@mantine/hooks";
import {IconGitBranch} from "@tabler/icons-react";
import {formatDistance} from "date-fns";
import useAdminList from "../../modules/hooks/useAdminList";
import User from "../../modules/classes/User";
import useUpdates from "../../modules/hooks/useUpdates";
import {colorScheme} from "../_app";

function UserRolesTable({data,open,setUser}) {

    const rows = data.map((item) => {
        let total = 0;
        const parentKeys = item.visits.reduce((acc,cur)=>{
            let parent = cur.parentKey;
            if(!acc[parent]){
                acc[parent] = 0;
            }

            acc[parent] += 1;
            total += 1;
            return acc
        },{})

        return (
            <Table.Tr key={item.name}>
                <Table.Td>
                    <Group gap="sm">
                        <Avatar size={40} src={item.image} imageProps={{referrerPolicy:"no-referrer"}} alt={item.name} radius={40} />
                        <div>
                            <Group>
                                <Text fz="sm" fw={500}> {item.name} </Text>
                                <Pill color="blue" variant="light">{item.role}</Pill>
                            </Group>

                            <Text fz="xs" c="dimmed"> {item.email} </Text>
                        </div>
                    </Group>
                </Table.Td>
                <Table.Td>{item.lastActive}</Table.Td>
                <Table.Td>
                    <Group justify="space-between">
                        {
                            Object
                                .entries(parentKeys)
                                .map(([key, value],index) => {
                                    return (
                                        <Text key={index} fz="xs" c={colorScheme.byIndex(index)} fw={700} truncate={'end'}>
                                            {key}
                                        </Text>
                                    )
                                })
                        }

                    </Group>
                    <Progress.Root size={'xl'}>
                        {
                            Object
                                .entries(parentKeys)
                                .map(([key, value],index) => {
                                    return (
                                        <Tooltip label={key} key={key} position="top" withArrow={false}>
                                            <Progress.Section
                                                className={classes.progressSection}
                                                value={value/total*100}
                                                color={colorScheme.byIndex(index)}
                                            >
                                                <Progress.Label>{value}</Progress.Label>
                                            </Progress.Section>
                                        </Tooltip>
                                    )
                                })
                        }

                    </Progress.Root>
                </Table.Td>
                <Table.Td>
                    {item.active ? (
                        <Badge fullWidth variant="light">
                            Active
                        </Badge>
                    ) : (
                        <Badge color="gray" fullWidth variant="light">
                            Inactive
                        </Badge>
                    )}
                </Table.Td>
                <Table.Td>
                    <Button
                        variant="light"
                        onClick={() => {
                            setUser(item);
                            open();
                        }}
                    >
                        View
                    </Button>
                </Table.Td>
            </Table.Tr>
        )});

    return (
        <Table.ScrollContainer minWidth={800}>
            <Table withTableBorder  verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Employee</Table.Th>
                        <Table.Th>Last active</Table.Th>
                        <Table.Th>Visits</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>View Timeline</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
}

const Test = () => {
    const usage = useUpdates("/api/usage");
    const [opened, { open, close }] = useDisclosure(false);
    const [user, setUser] = React.useState(null);
    const {adminList} = useAdminList();
    const users = !Array.isArray(usage) && Object.values(usage?.users).map((user)=> new User(user));

    if(!users) return null;

    let mappedUsers = users?.map((user)=>{
        // active is true if they have visited in the last 3 days
        let userObj = adminList.find((admin)=>admin.email.toLowerCase() === user.email.toLowerCase());
        let role = userObj?.roles?.length > 0 ? userObj.roles[0] : "User";
        return {
            image: user.image,
            name: user.name,
            email: user.email,
            role: role,
            lastActive: new Date(user.lastVisit?.timeStamp).toLocaleDateString(),
            active: user.daysSinceLastVisit < 3,
            visits: user.visits,
        }
    });
    return (
        <div>
            <Modal
                opened={opened}
                onClose={close}
                title={"Page Visit History"}
            >
                <Timeline mb={'2rem'} bulletSize={24} lineWidth={2} >
                    {user?.visits?.map((event,i) => {
                        return (
                            <Timeline.Item key={i} bullet={<IconGitBranch size={12} />} title={event.parentKey}>
                                <Text c="dimmed" size="sm" lineClamp={4}>{event.key}</Text>
                                <Group>
                                    <Text size="xs" mt={4}>{formatDistance(new Date(event.timeStamp),new Date())} ago</Text>
                                    <Text  c="dimmed" size="xs" mt={4}>{new Date(event.timeStamp).toLocaleDateString()}</Text>
                                    <Text c="dimmed" size="xs" mt={4}>{event.name}</Text>
                                </Group>
                            </Timeline.Item>
                        )
                    })
                    }
                </Timeline>
            </Modal>
            {users && <UserRolesTable open={open} setUser={setUser} data={mappedUsers}/>}
        </div>
    );
};

export default Test;