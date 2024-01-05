import {useSession} from "next-auth/react";
import {useShallowEffect} from "@mantine/hooks";

export default function useUsage(parentKey,key){
    const {data:session, status} = useSession();
    const user = session?.user;
    useShallowEffect(()=>{
        fetch('/api/usage',{
            method:'POST',
            body:JSON.stringify({parentKey,key,user})
        })
            .catch((err)=>console.log(err))
            .then((res)=>res.text())
            .then((res)=>console.log(res))
    },[key,parentKey,user])
}
