import createDefaultServerMessage from "./createDefaultMessage";

export default function createErrorMessage(message) {
    return createDefaultServerMessage(message,"danger");
}