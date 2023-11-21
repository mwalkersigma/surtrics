import React from 'react';
import {Button, rem} from '@mantine/core';
import {TableSort} from "../../components/mantine/TableSort";
import ViewerLayout from "../../components/mantine/ViewerLayout";
import useTable from "../../modules/hooks/useTable";
import {IconTrash} from "@tabler/icons-react";
import formatter from "../../modules/utils/numberFormatter";







const Ebay = () => {
    const {tableData,removeHandler,status} = useTable({route:"/api/dataEntry/bigCommerce",idField:"entry_id"})
    let removeEntry = removeHandler("/api/admin/event");
    console.log(tableData)
    return (
        <ViewerLayout title={"Big Commerce"} isLoading={status === "loading"}>
            <TableSort
                data={tableData.map((row) => ({
                    id: row.entry_id,
                    visits: formatter(row.visits),
                    shopped: formatter(row.shopped),
                    add_to_cart: formatter(row.add_to_cart),
                    web_leads: formatter(row.web_leads),
                    date: new Date(row.date_for_week).toLocaleDateString(),
                    remove: <Button
                        variant="filled"
                        color="red"
                        onClick={() => removeEntry(row.entry_id)}
                        leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}

                    >Remove</Button>,
                }))}
            />
        </ViewerLayout>
    );
};

export default Ebay;





// import React from 'react';
// import useUpdates from "../../modules/hooks/useUpdates";
// import useTableHandle from "../../modules/hooks/useTableHandle";
// import Table from "react-bootstrap/Table";
// import {format} from "date-fns";
// import Stack from "react-bootstrap/Stack";
// import Button from "react-bootstrap/Button";
// import Container from "react-bootstrap/Container";
//
// const BigCommerce = () => {
//     const update = useUpdates("/api/dataEntry/bigCommerce");
//     const { headers,rows,removeHandler} = useTableHandle(update,"entry_id");
//     const handleRemove = removeHandler("/api/dataEntry/bigCommerce");
//     return (
//         <Container>
//             <h1 className={"text-center my-4"}>Big Commerce Data</h1>
//             <Table striped bordered hover className={"text-center"}>
//                 <thead>
//                     <tr>
//                         {headers?.map((header) => (<th key={header.displayName}>{header.displayName}</th>))}
//                         {headers.length > 0 && <th>Remove</th>}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {rows?.map((row) => (
//                         <tr key={row.id}>
//                             <td>
//                                 {row.id}
//                             </td>
//                             <td>
//                                 {row.visits}
//                             </td>
//                             <td>
//                                 {row.shopped}
//                             </td>
//                             <td>
//                                 {row.web_leads}
//                             </td>
//                             <td>
//                                 {row.add_to_cart}
//                             </td>
//                             <td>
//                                 {format(new Date(row.date_for_week),"MM/dd/yyyy")}
//                             </td>
//                             <td>
//                                 {row.user_who_entered}
//                             </td>
//                             <td>
//                                 <Stack>
//                                     <Button onClick={()=>handleRemove(row.id)} variant={'outline-danger'}>Remove</Button>
//                                 </Stack>
//                             </td>
//                         </tr>
//
//                     ))}
//                 </tbody>
//             </Table>
//         </Container>
//     );
// };
//
// export default BigCommerce;