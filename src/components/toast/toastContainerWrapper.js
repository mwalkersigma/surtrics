import ToastMaker from "./ToastMaker";
import {ToastContainer} from "react-bootstrap";
import React from "react";

const ToastContainerWrapper = ({serverMessages,removeServerMessages}) => {
    return (
        <ToastContainer position={"bottom-end"} >
            {serverMessages.map((msg) => <ToastMaker
                key={msg.id}
                id={msg.id}
                message={msg.message}
                status={msg.status}
                handleRemove={()=>removeServerMessages(msg.id)}
            />)}
        </ToastContainer>
    );
};

export default ToastContainerWrapper;