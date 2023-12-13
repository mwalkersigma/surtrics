import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";
import formatter from "../../modules/utils/numberFormatter";
import useUsage from "../../modules/hooks/useUsage";







const BigCommerce = () => {
    useUsage("Ecommerce","PricingBacklog-UserEntries-viewer")
    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/pricingBacklog",idField:"entry_id"})
    let removeEntry = removeHandler("/api/dataEntry/pricingBacklog");
    return (
        <ViewerLayout title={"Pricing Backlog"} isLoading={status === "loading"}>
            <TableSort
                data={tableData.map((row) => ({
                    id: row['entry_id'],
                    dateEntered: row['date_entered'],
                    count: formatter(row['count']),
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

export default BigCommerce;