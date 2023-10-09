import React from 'react';
import useUpdates from "../../modules/hooks/useUpdates";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
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
import {Col, Row} from "react-bootstrap";

const ignoredNames = [
    "Bail", "" , "Whit","Finley Aldrid"
]

ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
);

function smoothData(data,adjCount=3) {
    // take the average of the current, n previous, and n next data points
    // where n is the adjCount
    let newData = [];
    for(let i = 0; i < data.length; i++) {
        let sum = 0;
        if(i < adjCount) {
            for(let j = 0; j < i + adjCount; j++) {
                sum += data[j];
            }
            newData.push(sum / (i + adjCount));
            continue;
        }

        if(i > data.length - adjCount) {
            for(let j = i - adjCount; j < data.length; j++) {
                sum += data[j];
            }
            newData.push(sum / (data.length - i + adjCount));
            continue;
        }

        for(let j = i - adjCount; j < i + adjCount; j++) {
            sum += data[j];
        }
        newData.push(sum / (adjCount * 2 + 1));
    }
    return newData;
}


const ApprovalsView = () => {
    let [user, setUser] = React.useState("Bailey Moesner");
    const [date, setDate] = React.useState(formatDateWithZeros(new Date()));
    const [resolution, setResolution] = React.useState(4);
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
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {},
        scales:{}
    }

    const graphData = {
        labels: Object
            .keys(userUpdates)
            .map((date)=> date.split("-")
            .splice(1,2)
            .join("-")),
        datasets: [
            {
            label: user,
            data: Object.values(userUpdates),
            fill: false,
            backgroundColor: colorScheme.red,
            borderColor: colorScheme.red,
            },
            {
                label: "Trend",
                data: smoothData(Object.values(userUpdates),resolution),
                fill: false,
                backgroundColor: colorScheme.blue,
                borderColor: colorScheme.blue,
            }
        ]
    }
    return (
            <Container>
                <h1 className={"text-center"}>Approvals View</h1>
                <Form.Select value={user} onChange={(e) => setUser(e.target.value)}>
                    {Object.keys(mappedUpdates).map((name) => {
                        if(ignoredNames.includes(name)) return null;
                        return <option key={name} value={name}>{name}</option>
                    })}
                </Form.Select>
                <Row className={"my-3"}>
                    <Col sm={2}>
                        <Form.Label>Year Select</Form.Label>
                        <Form.Control
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            type="date"
                        />
                    </Col>
                    <Col sm={8}></Col>
                    <Col sm={2}>
                        <Form.Label>Trend Line Resolution</Form.Label>
                        <Form.Control
                            type={'number'}
                            step={1}
                            min={1}
                            //max={graphData.datasets[0].data.length / 8}
                            max={Math.min(graphData.datasets[0].data.length / 8, 5)}
                            value={resolution}
                            onChange={(e) => setResolution(+e.target.value)}
                        />
                    </Col>
                </Row>

                <Line data={graphData} options={options} />
            </Container>
    );
};

export default ApprovalsView;