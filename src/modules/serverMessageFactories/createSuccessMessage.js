import createDefaultServerMessage from "./createDefaultMessage";


export default function createSuccessMessage(message) {
    return createDefaultServerMessage(message,"success");
}