import {useState} from "react";

const useBasicForm = (initialState) => {
    const [formState, setFormState] = useState(initialState);
    const handleChange = (key) => (e) => {
        setFormState({...formState, [key]: e.target.value});
    };
    const handleReset = () => {
        setFormState(initialState);
    }
    return [formState, handleChange, handleReset];

}

export default useBasicForm;