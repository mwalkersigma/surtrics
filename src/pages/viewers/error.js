import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";


const Error = () => {
    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/error",idField:"id"})

    let removeEntry = removeHandler("/api/dataEntry/error");

    return (
        <ViewerLayout title={"Errors"} isLoading={status === "loading"}>
            <TableSort
                data={tableData.map((row) => ({
                    id: row.id,
                    user: row.user,
                    transaction_date: new Date(row.transaction_date).toLocaleDateString(),
                    transaction_note: row.transaction_note,
                    transaction_reason: row.transaction_reason,
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