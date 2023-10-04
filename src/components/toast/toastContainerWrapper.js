
import React from "react";
import ToastContainer from "react-bootstrap/ToastContainer";
import ToastMaker from "./toastMaker";

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