
import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";
import formatter from "../../modules/utils/numberFormatter";







const Ebay = () => {
    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/quickBooks",idField:"po_id"})
    let removeEntry = removeHandler("/api/dataEntry/quickBooks");
    console.log(tableData)
    return (
        <ViewerLayout title={"Quick Books"} isLoading={status === "loading"}>
            <TableSort
                specialFormatting={[
                    {column: "purchase_total", fn:(value)=>formatter(value,"currency")},
                    {column: "po_number", fn:String}
                ]}
                data={tableData.map((row) => ({
                    id: row['po_id'],
                    po_name: row.po_name,
                    po_number: row.po_number,
                    po_date: new Date(row.po_date).toLocaleDateString(),
                    purchase_type: row.purchase_type,
                    purchase_total: row.purchase_total,
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