import {useState} from "react";

export default function useToastContainer () {
    const [serverMessages, setServerMessages] = useState([]);
    function setServerMessage(message) {
        setServerMessages([...serverMessages, message])
    }
    function removeServerMessage(id) {
        setServerMessages(serverMessages.filter((message) => message.id  !== id))
    }
    return [serverMessages, setServerMessage, removeServerMessage]
}