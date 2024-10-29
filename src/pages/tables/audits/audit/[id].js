import React from 'react';
import {useDocumentTitle} from "@mantine/hooks";
import {useQuery} from "@tanstack/react-query";
import {Center, Container, Group, Loader, Paper, SimpleGrid, Stack, Text, Title} from "@mantine/core";
import {StatsGroup} from "../../../../components/StatsGroup/StatsGroup";

export const getServerSideProps = async (context) => {
    const {id} = context.query
    return {
        props: {
            id,
        },
    }
}

function toPrecision(x, precision) {
    const y = +x + (10 ** -precision) / 2;
    return y - (y % (10 ** -precision));
}

const View = ({id}) => {
    useDocumentTitle(`Audit View ${id}`);

    const {data, isPending} = useQuery({
        queryKey: ['audit', id],
        queryFn: async () => {
            return await fetch('/api/dataEntry/audit/' + id + '?detailed=true')
                .then(res => res.json())
        }
    });
    if (isPending) {
        return <Container size={'responsive'}>
            <Title ta={'center'} mb={'sm'}> Audit ( Tote ID: {data?.['tote_id']} ) </Title>
            <Center>
                <Loader size={50}/>
            </Center>
        </Container>
    }

    const statsData = [
        {
            title: 'Item Count',
            stats: data?.['tote_qty'] ?? 0,
            description: 'The total number of items audited in the tote.',
        },
        {
            title: 'Incorrect Items found',
            stats: data?.['tote_qty_incorrect'] ?? 0,
            description: 'The total number of items found to be incorrect in the tote.',
        },
        {
            title: 'Perecent Correct',
            stats: `${toPrecision(((data?.['tote_qty'] - data?.['tote_qty_incorrect']) / data?.['tote_qty']) * 100, 2)}%`,
            description: `Their were ${data?.['tote_qty_incorrect']} incorrect items out of ${data?.['tote_qty']} total items audited.`,
        },
        {
            title: `Error${data?.['tote_errors'].length ?? 0 === 1 ? "" : "s"} Found`,
            stats: data?.['tote_errors'].length ?? 0,
            description: 'The total number of errors found during the audit.',
        }
    ];

    return (
        <Container size={'responsive'}>
            <Title ta={'center'} mb={'sm'}> Audit ( Tote ID: {data?.['tote_id']} ) </Title>
            <Text>
                <Text c={'dimmed'} fz={'sm'} span>
                    Audit Date: {" "}
                </Text>
                <Text fz={'xs'} span>
                    {new Date(data?.['audit_date']).toDateString()}
                </Text>
            </Text>
            <Text mb={'xl'}>
                <Text c={'dimmed'} fz={'sm'} span>
                    Audit Preformed by: {" "}
                </Text>
                <Text fz={'xs'} span>
                    {data?.['auditor']}
                </Text>
            </Text>
            <StatsGroup data={statsData}/>
            {data?.['tote_errors'].length > 0 && <>
                <Title mt={'xl'} mb={'sm'} order={2}> Errors </Title>
                <SimpleGrid cols={3} spacing={10}>
                    {data?.['tote_errors'].map((error, index) => {
                        return (
                            <Paper withBorder key={index} p={'md'} radius={'md'}>
                                <Stack gap={'sm'}>
                                    <Group w={'100%'} justify={'space-between'}>
                                        <Text>
                                            <Text c={'dimmed'} fz={'sm'} span>
                                                Location: {" "}
                                            </Text>
                                            <Text fz={'xs'} span>
                                                {error?.['location']}
                                            </Text>
                                        </Text>
                                        <Text>
                                            <Text c={'dimmed'} fz={'sm'} span>
                                                Reason: {" "}
                                            </Text>
                                            <Text fz={'xs'} span>
                                                {error?.['transaction_reason']}
                                            </Text>
                                        </Text>
                                    </Group>
                                    <Text lh={.5} mt={'md'} mb={0} c={'dimmed'} fz={'sm'}>
                                        Notes: {" "}
                                    </Text>
                                    <Text mt={0} fz={'xs'}>
                                        {error?.['transaction_note']}
                                    </Text>
                                </Stack>
                            </Paper>
                        )
                    })}
                </SimpleGrid>
            </>}

        </Container>
    );
};

export default View;