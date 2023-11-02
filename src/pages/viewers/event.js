import React from 'react';
import Container from "react-bootstrap/Container";
import useTableHandle from "../../modules/hooks/useTableHandle";
import useUpdates from "../../modules/hooks/useUpdates";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import {format} from "date-fns";

const Event = () => {
    const events = useUpdates("/api/admin/event");
    console.log(events)
    const {headers,rows,removeHandler} = useTableHandle(events,"event_id");
    const handleRemove = removeHandler("/api/admin/event")
    return (
        <Container>
            <Table bordered hover striped>
                <thead>
                    <tr>
                        {headers.map((header)=>{
                            return <th key={header.displayName}>{header.displayName}</th>
                        })}
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row)=>{
                        return <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.event_name}</td>
                            <td>{format(new Date(row.event_date),"MM/dd/yyyy")}</td>
                            <td>{row.event_notes}</td>
                            <td>{row.affected_categories}</td>
                            <td>{row.user_who_submitted}</td>
                            <td><Button variant={"outline-danger"} onClick={()=>handleRemove(row.id)}>Remove</Button></td>
                        </tr>
                    })}
                </tbody>
            </Table>
        </Container>
    );
};

export default Event;