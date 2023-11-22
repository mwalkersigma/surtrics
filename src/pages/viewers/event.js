import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";








const Event = () => {
    const {tableData,removeHandler,status} = useTable({route:"/api/admin/event",idField:"event_id"})
    let removeEntry = removeHandler("/api/admin/event");

    return (
        <ViewerLayout title={"Events"} isLoading={status === "loading"}>
            <TableSort
                data={tableData.map((row) => ({
                    event_id: row.event_id,
                    event_date: new Date(row.event_date).toLocaleDateString(),
                    event_name: row.event_name,
                    event_notes: row.event_notes,
                    affected_categories: row.affected_categories.join(", "),
                    remove: <Button
                        variant="filled"
                        color="red"
                        onClick={() => removeEntry(row.event_id)}
                        leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}

                    >Remove</Button>,
                }))}
            />
        </ViewerLayout>
    );
};

export default Event;