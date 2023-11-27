import React from 'react';
import {TableSort} from "../../components/mantine/TableSort";
import useTable from "../../modules/hooks/useTable";
import {Button, rem } from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";

const ErrorPanel = () => {
    const assignedValues = {
        "Total Output": "Error/(incrementations+Approvals)",
        "Incrementation": "Error/Approvals",
        "Approvals": "Error/Incrementations",
    }
    const { tableData, removeHandler } = useTable({route:"/api/admin/error",idField:"name"});

    const removeError = removeHandler("/api/admin/error");
    if(tableData.length === 0)return 'loading';
    return (
        <TableSort data={tableData.map((row,i)=>({
                id:i,
                name: row.name,
                definition: row.definition,
                assigned:row.assigned,
                formula:assignedValues[row.assigned],
                remove: <Button
                    variant="filled"
                    color="red"
                    onClick={() => removeError(row.name)}
                    leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                >
                    Remove
                </Button>
        })
        )}
        />
    )
};

export default ErrorPanel;