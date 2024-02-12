import { useEffect } from "react";

export default function useWindow(callback,deps) {
    useEffect(()=>{
        if(typeof window !== "undefined"){
            callback();
        }
    },deps)
}