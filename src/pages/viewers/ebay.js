import React, {useEffect, useState} from 'react';
import Container from "react-bootstrap/Container";
import useUpdates from "../../modules/hooks/useUpdates";
import Table from "react-bootstrap/Table";
import {format} from "date-fns";
import formatter from "../../modules/utils/numberFormatter";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import {toHeaderCase} from "js-convert-case"
import useTableHandle from "../../modules/hooks/useTableHandle";


const EbayDataViewer = () => {
    const update = useUpdates("/api/dataEntry/ebay")
    const { headers,rows,removeHandler} = useTableHandle(update,"entry_id");

    const handleRemove = removeHandler("/api/dataEntry/ebay");

    return (
        <Container>
            <Table striped bordered hover className={"text-center"}>
                <thead>
                    <tr>
                        {headers?.map((header) => (
                            <th key={header.displayName}>{header.displayName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows?.map((row) => (
                        <tr key={row.id}>
                            <td>
                                {row.id}
                            </td>
                            <td>
                                {formatter(row.impressions)}
                            </td>
                            <td>
                                {formatter(row.page_views)}
                            </td>
                            <td>
                                {format(new Date(row.date_for_week),"MM/dd/yyyy")}
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

export default EbayDataViewer;