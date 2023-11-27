
import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";
import formatter from "../../modules/utils/numberFormatter";







const Ebay = () => {
    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/quickBooks",idField:"po_id"})
    let removeEntry = removeHandler("/api/admin/event");
    console.log(tableData)
    return (
        <ViewerLayout title={"Quick Books"} isLoading={status === "loading"}>
            <TableSort
                specialFormatting={[
                    //{column: "impressions", fn:(value)=>formatter(value,"currency")},
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




// import React from 'react';
// import Container from "react-bootstrap/Container";
// import useUpdates from "../../modules/hooks/useUpdates";
// import useTableHandle from "../../modules/hooks/useTableHandle";
// import Table from "react-bootstrap/Table";
// import Button from "react-bootstrap/Button";
// import formatter from "../../modules/utils/numberFormatter";
// import {format} from "date-fns";
//
// const QuickBooks = () => {
//     const pos = useUpdates("/api/dataEntry/quickBooks");
//     const {headers,rows,removeHandler} = useTableHandle(pos,"po_id");
//     const handleRemove = removeHandler("/api/dataEntry/quickBooks");
//     return (
//         <Container>
//             <h1 className={"text-center my-4"}>Quick Books Data</h1>
//             <Table striped bordered hover>
//                 <thead>
//                     <tr>
//                         {headers?.map((header) => (<th key={header.displayName}>{header.displayName}</th>))}
//                         {headers.length > 0 && <th>Remove</th>}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {
//                         rows?.map((row) => {
//                             return (
//                                 <tr key={row.po_id}>
//                                     <td>{row.po_id}</td>
//                                     <td>{row.po_name}</td>
//                                     <td>{row.po_number}</td>
//                                     <td>{format(new Date(row.po_date), "MM/dd/yyyy")}</td>
//                                     <td>{row.purchase_type}</td>
//                                     <td>{formatter(row.purchase_total,"currency") }</td>
//                                     <td>{row.user_who_submitted}</td>
//                                     <td><Button variant={"outline-danger"} onClick={() => handleRemove(row.po_id)}>Remove</Button></td>
//                                 </tr>
//                             )
//                         })
//                     }
//                 </tbody>
//             </Table>
//         </Container>
//     );
// };
//
// export default QuickBooks;