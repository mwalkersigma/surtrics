import React, {useEffect, useState} from 'react';

import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import ToastContainerWrapper from "../../components/toast/toastContainerWrapper";

import useToastContainer from "../../modules/hooks/useToast";
import createSuccessMessage from "../../modules/serverMessageFactories/createSuccessMessage";
import createErrorMessage from "../../modules/serverMessageFactories/createErrorMessage";
import RoleWrapper from "../../components/RoleWrapper";



const ErrorViewer = () => {
    const [date, setDate] = useState(false);
    const [serverData, setServerData] = useState([]);
    const [serverMessage, setServerMessage, removeServerMessage] = useToastContainer();

    useEffect(()=>{
        let options = {};
        if(date){
            options = {
                method:"POST",
                body:JSON.stringify({date})
            }
        }
        fetch(`${window.location.origin}/api/admin/error`,options)
            .then((res)=>res.json())
            .then(setServerData);

    },[setServerData,date]);

    function resetDate(){
        setDate(false);
    }
    function removeEntry (e) {
        e.preventDefault();
        return(id)=>fetch(`${window.location.origin}/api/admin/error`,{
            method:"DELETE",
            body:JSON.stringify({id})
        })
            .then((res)=>res.json())
            .then((res)=> setServerMessage(createSuccessMessage(res)))
            .catch((err)=>setServerMessage(createErrorMessage(err)))
            .finally(()=>{
                setServerData(serverData.filter((row)=>row.id !== id));
            })
    }

    return (
        <RoleWrapper altRoles={["surplus director","bsa"]}>
            <Container>
                <ToastContainerWrapper removeServerMessages={removeServerMessage} serverMessages={serverMessage}/>
                <h1>Error Reporting</h1>
                <Row>
                    <Col sm={4}>
                        <Form.Control
                            type={"date"}
                            onChange={(e)=>setDate(e.target.value)}
                            className={"my-3"}
                            md={4}
                        />

                    </Col>

                    <Col sm={2}>
                        <Button onClick={resetDate} className={"mt-3"} variant={"danger"}>Remove Filter</Button>
                    </Col>
                </Row>

                <Table bordered striped hover>
                    <thead>
                    <tr>
                        <th >User</th>
                        <th>Reason</th>
                        <th colSpan={4}>Notes</th>
                        <th>Remove</th>
                    </tr>
                    </thead>
                    <tbody>
                    {serverData && serverData?.map && serverData.map((row)=>(
                        <tr key={row.id}>
                            <td>{row.user}</td>
                            <td>{row.transaction_reason}</td>
                            <td colSpan={4}>{row.transaction_note}</td>
                            <td>
                                <a
                                    className={"text-decoration-none hover-remove"}
                                    onClick={(e)=>removeEntry(e)(row.id)}
                                    style={{
                                        cursor:"pointer",
                                        border:"1px solid red",
                                        textAlign:"center",
                                        borderRadius:"5px",
                                        display:"block",
                                    }}
                                >
                                    Remove
                                </a>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </Container>
        </RoleWrapper>

    );
};

export default ErrorViewer;