import {useState} from "react";

//remove leading 0
function removeLeadingZero(str){
    if(!str){return str}
    if(typeof str === 'number'){
        str = str.toString();
    }
    if(str.length === 1){
        return str;
    }
    if(str[0] === '0'){
        return str.slice(1);
    }
    return str;
}

const useBasicForm = (initialState) => {
    const [formState, setFormState] = useState(initialState);
    const handleChange = (key) => (e) => {
        setFormState({...formState, [key]: removeLeadingZero(e.target.value)});
    };
    const handleReset = () => {
        setFormState(initialState);
    }
    return [formState, handleChange, handleReset];

}

export default useBasicForm;