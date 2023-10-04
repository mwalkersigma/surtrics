import React, {useEffect, useState} from 'react';

import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import ToastContainerWrapper from "../../components/toast/toastContainerWrapper";
import useToastContainer from "../../modules/hooks/useToast";
import createSuccessMessage from "../../modules/serverMessageFactories/createSuccessMessage";
import createErrorMessage from "../../modules/serverMessageFactories/createErrorMessage";

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
        fetch(`${window.location.origin}/api/admin/getErrorsByReporter`,options)
            .then((res)=>res.json())
            .then(setServerData);

    },[setServerData,date]);

    function removeEntry (e) {
        e.preventDefault();
        return(id)=>fetch(`${window.location.origin}/api/admin/removeError`,{
            method:"POST",
            body:JSON.stringify({id})
        })
            .then((res)=>res.json())
            .then((res)=> setServerMessage(createSuccessMessage(res)))
            .catch((err)=>setServerMessage(createErrorMessage(err)))
            .finally(()=>{
                setServerData(serverData.filter((row)=>row.id !== id));
            })
    }
    console.log(serverData);
    return (
        <Container>
            <ToastContainerWrapper removeServerMessages={removeServerMessage} serverMessages={serverMessage}/>
            <h1>Error Reporting</h1>
            <Form.Control
                type={"date"}
                onChange={(e)=>setDate(e.target.value)}
                className={"my-3"}
            />
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
    );
};

export default ErrorViewer;