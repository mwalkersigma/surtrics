import {useEffect} from "react";

export default function useUsage(parentKey,key){
    useEffect(()=>{
        fetch('/api/usage',{
            method:'POST',
            body:JSON.stringify({parentKey,key})
        })
            .catch((err)=>console.log(err))
            .then((res)=>res.text())
            .then((res)=>console.log(res))
    },[key,parentKey])
}
