import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";
import useUsage from "../../modules/hooks/useUsage";







const Ebay = () => {
    useUsage("Ecommerce","ebay-UserEntries-viewer")
    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/ebay",idField:"entry_id"})
    let removeEntry = removeHandler("/api/dataEntry/ebay");

    return (
        <ViewerLayout title={"ebay"} isLoading={status === "loading"}>
            <TableSort
                data={tableData.map((row) => ({
                    id: row['entry_id'],
                    impressions: row.impressions,
                    page_views: row.page_views,
                    date_for_week: new Date(row.date_for_week).toLocaleDateString(),
                    remove: <Button
                        variant="filled"
                        color="red"
                        onClick={() => removeEntry(row['entry_id'])}
                        leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}

                    >Remove</Button>,
                }))}
            />
        </ViewerLayout>
    );
};

export default Ebay;


