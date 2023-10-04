import React, {useState} from 'react';

import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";

import useUpdates from "../../modules/hooks/useUpdates";

import makeDateArray from "../../modules/utils/makeDateArray";
import formatDatabaseRows from "../../modules/utils/formatDatabaseRows";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";

const WarehousePicks = () => {
    const [date, setDate] = useState(formatDateWithZeros(new Date()));
    const updates = useUpdates("/api/views/picks/warehousePicks",{date});
    const dates = makeDateArray(date);
    let rows = formatDatabaseRows(updates);

    return (
        <Container>
            <h1 className={"text-center"}>Warehouse Picks</h1>
            <Form.Control
                className={"mb-3"}
                value={date}
                onChange={(e)=>setDate(e.target.value)}
                type="date"
            />
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Employee</th>
                        {dates.map((date) => <th key={`${date}`}>{date}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(rows).map((employee) => {
                        return (
                            <tr key={employee}>
                                <td>{employee}</td>
                                {dates.map((rowDate) => {

                                    return (
                                        <td key={`${employee}-${rowDate}`}>
                                            {rows[employee][rowDate+"T05:00:00.000Z"]?.Total ?? 0}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default WarehousePicks;