import React from "react";
import {Toast} from "react-bootstrap";

const ToastMaker = (props) => {
    let toastStyle = {
        marginRight:"1rem",
        marginBottom:"1rem"
    }
    let headerStyle = {
        justifyContent:"space-between"
    }
    let bodyStyle = {
        padding: "1rem",
        fontSize: "1.2rem",
        fontWeight: "bold"
    }
    let isList = false;
    if(Array.isArray(props.message)){
        isList = true;
        bodyStyle = {
            padding: "1rem",
            fontSize: ".9rem",
            fontWeight: "bold",
            fontFamily: "monospace"
        }
    }
    return (
        <Toast style={toastStyle} bg={props.status.toLowerCase()} onClose={props.handleRemove} show={true} delay={5000} autohide >
            <Toast.Header style={headerStyle}><h5>Surprice Server says:</h5>  </Toast.Header>
            <Toast.Body style={bodyStyle}>
                {!isList && props.message}
                {isList && props.message.map((item,index)=><div key={index}>{item}</div>)}
            </Toast.Body>
            <footer style={{padding:'0 1rem .5rem 1rem',color:'light-gray'}}>
                <small>RUN ID : {props.id}</small>
            </footer>
        </Toast>
    )
}

export default ToastMaker;