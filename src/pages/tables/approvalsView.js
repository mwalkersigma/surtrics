import React from 'react';
import useUpdates from "../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import makeDateArray from "../../modules/utils/makeDateArray";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import yymmddTommddyy from "../../modules/utils/yymmddconverter";

const ApprovalsView = () => {
    const [date, setDate] = React.useState(formatDateWithZeros(new Date()));
    const updates = useUpdates("/api/views/approvals/weeklyView", {date});
    let mappedUpdates = {};
    updates.forEach((update) => {
        let name = update.name;
        let date = update["date_of_final_approval"].split("T")[0];
        if(!mappedUpdates[name]) mappedUpdates[name] = {};
        if(!mappedUpdates[name][date]) mappedUpdates[name][date] = 0;
        mappedUpdates[name][date] += parseInt(update.count);
    })
    let weekArr = makeDateArray(date);
    return (
        <Container>
            <h1 className={"text-center"}>Approvals View</h1>
            <Form.Control
                className={"my-3"}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                value={date}
            />
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        {weekArr.map((date) => <th key={date}>{yymmddTommddyy(date)}</th>)}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(mappedUpdates).map((name) => {
                        return (
                            <tr key={name}>
                                <td>{name}</td>
                                {weekArr.map((date) => {
                                    return (
                                        <td key={date}>
                                            {mappedUpdates[name][date] ? mappedUpdates[name][date] : 0}
                                        </td>
                                    )
                                })}
                                <td>{Object.values(mappedUpdates[name]).reduce((a,b) => a+b,0)}</td>
                            </tr>
                        )}
                    )}
                </tbody>

            </Table>
        </Container>
    );
};

export default ApprovalsView;