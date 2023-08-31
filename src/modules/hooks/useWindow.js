import {useEffect} from "react";


export default function useWindow (cb,deps) {
    useEffect(()=>{
        if(typeof window !== 'undefined') {
            cb()
        }
    },deps)
}