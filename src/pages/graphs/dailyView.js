import React, {useState} from 'react';

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import useUpdates from "../../modules/hooks/useUpdates";
import LineGraph from "../../components/lineGraph";


const convertDate = (date) => `${date.getFullYear()}-${date.getMonth().length > 1 ? "" : "0"}${date.getMonth() + 1}-${date.getDate()}`


const DailyView = () => {
    const [date,setDate] = useState(convertDate(new Date()))

    let dailyData = useUpdates("/api/views/dailyView",{date});

    if(dailyData.length === 0)return(
        <Container className={"text-center"}>
            <Form.Control className={"mb-5"} value={date} onChange={(e)=>setDate(e.target.value)} type="date" />
            Loading...
        </Container>
    );
    dailyData = dailyData.map(({count}) => +count);
    return (
        <Container>
            <Form.Control
                className={"mb-3"}
                value={date}
                onChange={(e)=>setDate(e.target.value)}
                type="date"
            />
            <LineGraph dailyData={dailyData} />
        </Container>
    );
};

export default DailyView;