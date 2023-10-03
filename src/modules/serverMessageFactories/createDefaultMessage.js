import Random from "another-random-package";

export default function createDefaultServerMessage(message,status) {
    return {
        message,
        status,
        id:Random.randomStringAlphaNumeric(10)
    }
}