import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";
import useUsage from "../../modules/hooks/useUsage";







const Ebay = () => {
    useUsage("Ecommerce","ebayDefectRate-UserEntries-viewer")
    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/ebayDefectRate",idField:"id"})
    let removeEntry = removeHandler("/api/dataEntry/ebayDefectRate");

    return (
        <ViewerLayout title={"ebay"} isLoading={status === "loading"}>
            <TableSort
                data={tableData.map((row) => ({
                    id: row['id'],
                    defectRate: row['defect_rate'],
                    date_for_week: new Date(row['date_entered']).toLocaleDateString(),
                    remove: <Button
                        variant="filled"
                        color="red"
                        onClick={() => removeEntry(row['id'])}
                        leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}

                    >Remove</Button>,
                }))}
            />
        </ViewerLayout>
    );
};

export default Ebay;