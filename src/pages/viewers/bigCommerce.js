import React from 'react';
import useUpdates from "../../modules/hooks/useUpdates";
import useTableHandle from "../../modules/hooks/useTableHandle";
import Table from "react-bootstrap/Table";
import {format} from "date-fns";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

const BigCommerce = () => {
    const update = useUpdates("/api/dataEntry/bigCommerce");
    console.log(update)
    const { headers,rows,removeHandler} = useTableHandle(update,"entry_id");
    const handleRemove = removeHandler("/api/dataEntry/bigCommerce");
    return (
        <Container>
            <Table striped bordered hover className={"text-center"}>
                <thead>
                    <tr>
                        {headers?.map((header) => (<th key={header.displayName}>{header.displayName}</th>))}
                        {headers.length > 0 && <th>Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows?.map((row) => (
                        <tr key={row.id}>
                            <td>
                                {row.id}
                            </td>
                            <td>
                                {row.visits}
                            </td>
                            <td>
                                {row.shopped}
                            </td>
                            <td>
                                {row.web_leads}
                            </td>
                            <td>
                                {row.add_to_cart}
                            </td>
                            <td>
                                {format(new Date(row.date_for_week),"MM/dd/yyyy")}
                            </td>
                            <td>
                                {row.user_who_entered}
                            </td>
                            <td>
                                <Stack>
                                    <Button onClick={()=>handleRemove(row.id)} variant={'outline-danger'}>Remove</Button>
                                </Stack>
                            </td>
                        </tr>

                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default BigCommerce;