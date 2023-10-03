import createDefaultServerMessage from "./createDefaultMessage";

export default function createWarningMessage(message) {
    return createDefaultServerMessage(message,"warning");
}