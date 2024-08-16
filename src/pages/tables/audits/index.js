import {useMutation, useQuery} from "@tanstack/react-query";
import {queryClient} from "../../_app";
import {Button, Container, Group, Modal, Title} from "@mantine/core";
import {TableSort} from "../../../components/tableSort/tableSort";
import React, {useCallback, useState} from "react";
import {useDisclosure} from "@mantine/hooks";
import {AuditForm} from "../../BSA/QualityAudits";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";


function EditForm({audit, close}) {
    const auditForm = useForm({
        initialValues: {
            auditDate: new Date(audit.audit_date),
            toteID: audit.tote_id,
            toteQuantity: audit.tote_qty,
            quantityIncorrect: audit.tote_qty_incorrect,
        }
    });
    audit.tote_errors = audit.tote_errors.map(error => ({
        ...error,
        notes: error.transaction_note,
        reason: error.transaction_reason
    }));
    const [errors, setErrors] = useState(audit.tote_errors);
    const editMutation = useMutation({
        mutationFn: async (values) => {
            let body = {
                ...audit,
                ...values,
                tote_errors: errors
            }
            return await fetch('/api/dataEntry/audit/' + audit.id, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
        },
        onSuccess: () => {
            notifications.show({title: 'Message', message: "The audit has been successfully updated", color: 'teal'});
            queryClient.invalidateQueries(['audits'])
            close();
        }
    });
    return <AuditForm
        formControl={auditForm}
        mutationHandler={editMutation}
        errors={errors}
        setErrors={setErrors}
    />
}

const AuditTable = () => {
    const [opened, {open, close}] = useDisclosure(false);
    const [audit, setAudit] = useState(null);

    const {data, isPending} = useQuery({
        queryKey: ['audits'],
        queryFn: async () => {
            return await fetch('/api/dataEntry/audit?detailed=true')
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


    const clickHandler = useCallback((v) => {
        setAudit(v);
        open();
    }, [open]);


    let tableData = data ?? [];

    return (
        <Container size={'responsive'}>
            <Modal title={'Edit Audit'} size={'100%'} opened={opened} onClose={close}>
                <EditForm close={close} audit={audit}/>
            </Modal>
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
                            <Button
                                color={'blue'}
                                onClick={() => clickHandler(audit)}
                            >Edit</Button>
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