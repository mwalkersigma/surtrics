import {useEffect, useState} from "react";


export default function useFrequency(){
    const [frequency,setFrequency] = useState(0);
    useEffect(()=>{
        fetch("/api/getFrequency")
            .then(res=>res.json())
            .then(data=>setFrequency(data.frequency))
            .catch(err=>console.log(err));
    },[])
    return frequency;
}