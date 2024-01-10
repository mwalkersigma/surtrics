import React, {useState} from 'react';
import {Button, Container, Group, Text, Timeline, Title, Tooltip} from "@mantine/core";
import {IconGitBranch} from "@tabler/icons-react";
import useUpdates from "../../modules/hooks/useUpdates";
import {formatDistance} from "date-fns";
import useUsage from "../../modules/hooks/useUsage";



const direction = (state) => state ? "ASC" : "DESC" ;
const directionFunctions = {
    'ASC': (a,b) => new Date(a.event_date) - new Date(b.event_date),
    'DESC': (a,b) => new Date(b.event_date) - new Date(a.event_date)
}

const SurplusNotableEvents = () => {
    useUsage("Metrics","notableEvents-rangeView-timeline")
    const [sortDirection,setSortDirection] = useState(false);
    const events = useUpdates("/api/views/events",{includedCategories:['Processing','Warehouse']});
    events.sort(directionFunctions[direction(sortDirection)])

    return (
        <Container>
            <Title ta={'center'} mb={'2rem'}>Surplus Notable Events Timeline</Title>
            <Group mb={'2rem'} justify={'flex-end'}>
                <Text>Sort Direction:</Text>
                <Button onClick={() => setSortDirection(!sortDirection)}>{direction(sortDirection)}</Button>
            </Group>
            <Timeline mb={'2rem'} bulletSize={24} lineWidth={2} >
                {events.map((event,i) => {
                    return (
                        <Timeline.Item key={i} bullet={<IconGitBranch size={12} />} title={event.event_name}>
                            <Tooltip label={event.event_notes} multiline w={400}  withArrow>
                                <Text c="dimmed" size="sm" lineClamp={4}>{event.event_notes}</Text>
                            </Tooltip>
                            <Group>
                                <Text size="xs" mt={4}>{formatDistance(new Date(event.event_date),new Date())} ago</Text>
                                <Text  c="dimmed" size="xs" mt={4}>{new Date(event.event_date).toLocaleDateString()}</Text>
                                <Text c="dimmed" size="xs" mt={4}>{event.user_who_submitted}</Text>
                            </Group>


                        </Timeline.Item>
                    )
                })
                }
            </Timeline>
        </Container>
    );
};

export default SurplusNotableEvents;