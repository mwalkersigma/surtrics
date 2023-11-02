import React from 'react';
import Container from "react-bootstrap/Container";
import useUpdates from "../../modules/hooks/useUpdates";
import useTableHandle from "../../modules/hooks/useTableHandle";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import formatter from "../../modules/utils/numberFormatter";
import {format} from "date-fns";

const QuickBooks = () => {
    const pos = useUpdates("/api/dataEntry/quickBooks");
    const {headers,rows,removeHandler} = useTableHandle(pos,"po_id");
    const handleRemove = removeHandler("/api/dataEntry/quickBooks");
    return (
        <Container>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        {headers?.map((header) => (<th key={header.displayName}>{header.displayName}</th>))}
                        {headers.length > 0 && <th>Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {
                        rows?.map((row) => {
                            return (
                                <tr key={row.po_id}>
                                    <td>{row.po_id}</td>
                                    <td>{row.po_name}</td>
                                    <td>{row.po_number}</td>
                                    <td>{format(new Date(row.po_date), "MM/dd/yyyy")}</td>
                                    <td>{row.purchase_type}</td>
                                    <td>{formatter(row.purchase_total,"currency") }</td>
                                    <td>{row.user_who_submitted}</td>
                                    <td><Button variant={"outline-danger"} onClick={() => handleRemove(row.po_id)}>Remove</Button></td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        </Container>
    );
};

export default QuickBooks;