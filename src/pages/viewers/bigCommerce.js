import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";
import formatter from "../../modules/utils/numberFormatter";







const BigCommerce = () => {
    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/bigCommerce",idField:"entry_id"})
    let removeEntry = removeHandler("/api/admin/event");
    console.log(tableData)
    return (
        <ViewerLayout title={"Big Commerce"} isLoading={status === "loading"}>
            <TableSort
                data={tableData.map((row) => ({
                    id: row['entry_id'],
                    visits: formatter(row.visits),
                    shopped: formatter(row.shopped),
                    add_to_cart: formatter(row.add_to_cart),
                    web_leads: formatter(row.web_leads),
                    date: new Date(row.date_for_week).toLocaleDateString(),
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