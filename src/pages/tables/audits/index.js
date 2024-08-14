import {useMutation, useQuery} from "@tanstack/react-query";
import {queryClient} from "../../_app";
import {Button, Container, Group, Title} from "@mantine/core";
import {TableSort} from "../../../components/tableSort/tableSort";
import React from "react";

const AuditTable = () => {
    const {data, isPending} = useQuery({
        queryKey: ['audits'],
        queryFn: async () => {
            return await fetch('/api/dataEntry/audit')
                .then(res => res.json())
        }
    });
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await fetch('/api/dataEntry/audit', {
                method: 'DELETE',
                body: JSON.stringify({id}),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
        },
        onSuccess: () => {
            return queryClient.invalidateQueries(['audits'])
        }
    });

    let tableData = data ?? [];

    return (
        <Container size={'responsive'}>
            <Title mb={'lg'} order={1}> Audits </Title>
            <TableSort
                loading={isPending}
                specialFormatting={[
                    {
                        column: 'toteID',
                        fn: value => value
                    }
                ]}
                noDisplay={['id']}
                noToolTip={['actions']}
                columnProps={{
                    actions: {
                        w: 350
                    }
                }}
                data={tableData.map(audit => {
                    return {
                        id: audit.id,
                        auditDate: audit.audit_date,
                        toteID: audit.tote_id,
                        toteQuantity: audit.tote_qty,
                        quantityIncorrect: audit.tote_qty_incorrect,
                        auditor: audit.auditor,
                        actions: <Group>
                            <Button
                                color={'green'}
                                component={'a'}
                                href={`/tables/audits/audit/${audit.id}`}
                            >
                                View
                            </Button>
                            <Button color={'blue'}>Edit</Button>
                            <Button
                                loading={deleteMutation.isLoading}
                                onClick={() => confirm("Delete this audit ?") && deleteMutation.mutate(audit.id)}
                                color={'red'}
                            >
                                Delete
                            </Button>
                        </Group>
                    }
                })}
            />
        </Container>
    );
};


export default AuditTable;