import {useState} from "react";


/**
 * @function
 * @name useToastContainer
 * @description A hook to manage the toast container returns the server messages, a function to add a message, and a function to remove a message
 * @example
 * import useToastContainer from "location";
 * const [messages, set, remove] = useToastContainer();
 * return <ToastContainer removeServerMessage={remove} serverMessages={messages} >
 * @return {[*[],setServerMessage,removeServerMessage,bundle]}
 */
export default function useToastContainer () {
    const [serverMessages, setServerMessages] = useState([]);
    function setServerMessage(message) {
        setServerMessages([...serverMessages, message])
    }
    function removeServerMessage(id) {
        setServerMessages(serverMessages.filter((message) => message.id  !== id))
    }
    const bundle = {serverMessages, setServerMessage, removeServerMessage};
    return [serverMessages, setServerMessage, removeServerMessage,bundle]
}