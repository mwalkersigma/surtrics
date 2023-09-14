import React, {useContext, useState} from 'react';
import Form from "react-bootstrap/Form";
import useUpdates from "../../modules/hooks/useUpdates";
import LineGraph from "../../components/lineGraph";
import {ThemeContext} from "../layout";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";
import InfoCard from "../../components/infoCards/infocard";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement, PointElement,
    Title,
    Tooltip
} from "chart.js";
import formatter from "../../modules/utils/numberFormatter";



ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
);

const DailyView = () => {
    const [date,setDate] = useState(formatDateWithZeros(new Date()))
    let dailyData = useUpdates("/api/views/dailyView",{date});
    const theme = useContext(ThemeContext)
    if(dailyData.length === 0)return(
        <Container className={"text-center"}>
            <Form.Control className={"mb-5"} value={date} onChange={(e)=>setDate(e.target.value)} type="date" />
            Loading... ( If this takes more than 10 seconds, there is probably no data for this date )
        </Container>
    );
    dailyData = dailyData.map(({count}) => +count);
    let margin = "3rem";
    return (
        <Container>
            <Form.Control
                className={"mb-3"}
                value={date}
                onChange={(e)=>setDate(e.target.value)}
                type="date"
            />
            <Row>
                <Col sm={10} className={`themed-drop-shadow ${theme}`} style={{border:`1px ${theme === "dark" ? "white" : "black" } solid`}} >
                    <LineGraph title={"Daily View"} height={150} dailyData={dailyData} theme={theme} />
                </Col>
                <Col sm={2}>
                    <InfoCard style={{marginBottom:margin}}  title={"Total"} theme={theme}>
                        {formatter(dailyData.reduce((a,b) => a + b,0))}
                    </InfoCard>
                    <InfoCard style={{marginBottom:margin}} title={"Average"} theme={theme}>
                        {formatter(Math.round(dailyData.reduce((a,b) => a + b,0) / dailyData.length))}
                    </InfoCard>
                    <InfoCard style={{marginBottom:0}} title={"Best Hour"} theme={theme}>
                        {formatter(dailyData.reduce((a,b) => a > b ? a : b,0))}
                    </InfoCard>
                </Col>
            </Row>

        </Container>
    );
};




export default DailyView;