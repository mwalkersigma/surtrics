import React from 'react';
import useUpdates from "../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import AdminWrapper from "../../components/AdminWrapper";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from "chart.js";
import {Line} from "react-chartjs-2";
import {colorScheme} from "../_app";

const ignoredNames = ["Bail", "" , "Whit",]
ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
);

const ApprovalsView = () => {
    let [user, setUser] = React.useState("Bailey Moesner");
    const [date, setDate] = React.useState(formatDateWithZeros(new Date()));
    const updates = useUpdates("/api/views/approvals/yearlyView", {date});
    if(!(updates.length > 0)) return <Container>
        <Form.Control
            className={"my-2"}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
        />
        Loading...
    </Container>;

    let mappedUpdates = {};
    updates
        .sort((a,b) => {
            // sort them by date
            let aDate = a["date_of_final_approval"];
            let bDate = b["date_of_final_approval"];
            if(aDate < bDate) return -1;
            if(aDate > bDate) return 1;
            return 0;
        })
        .forEach((update) => {
        let name = update.name;
        let date = update["date_of_final_approval"].split("T")[0];
        if(!mappedUpdates[name]) mappedUpdates[name] = {};
        if(!mappedUpdates[name][date]) mappedUpdates[name][date] = 0;
        mappedUpdates[name][date] += parseInt(update.count);
    })
    let userUpdates = mappedUpdates[user] || {};
    const options = {
        devicePixelRatio: 4,
        responsive: true,
        tension: 0.1,
        plugins: {},
        scales:{}
    }

    const graphData = {
        labels: Object
            .keys(userUpdates)
            .map((date)=> date.split("-")
            .splice(1,2)
            .join("-")),
        datasets: [{
            label: user,
            data: Object.values(userUpdates),
            fill: false,
            backgroundColor: colorScheme.red,
            borderColor: colorScheme.red,
        }]
    }
    return (
        <AdminWrapper>
            <Container>
                <h1 className={"text-center"}>Approvals View</h1>
                <Form.Select value={user} onChange={(e) => setUser(e.target.value)}>
                    {Object.keys(mappedUpdates).map((name) => {
                        if(ignoredNames.includes(name)) return null;
                        return <option key={name} value={name}>{name}</option>
                    }
                    )}
                </Form.Select>
                <Form.Control
                    className={"my-2"}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                />
                <Line data={graphData} options={options} />
            </Container>
        </AdminWrapper>

    );
};

export default ApprovalsView;