import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../../components/mantine/TableSort";
import ViewerLayout from "../../../components/mantine/ViewerLayout";
import useTable from "../../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";
import useUsage from "../../../modules/hooks/useUsage";


const Error = () => {
    useUsage("Metrics","SkillAssessment-UserEntries-viewer");

    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/skillAssessment",idField:"id"})
    let removeEntry = removeHandler("/api/dataEntry/skillAssessment");

    return (
        <ViewerLayout title={"Skill Assessments"} isLoading={status === "loading"}>
            <TableSort
                noDisplay={["id"]}
                data={tableData.map((row) => ({
                    id: row.id,
                    date: new Date(row['transaction_date']).toLocaleDateString(),
                    user: row.user,
                    note: row['transaction_note'],
                    score: row.score,
                    remove: <Button
                        variant="filled"
                        color="red"
                        onClick={() => removeEntry(row.id)}
                        leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}

                    >Remove</Button>,
                }))}
            />
        </ViewerLayout>
    );
};

export default Error;