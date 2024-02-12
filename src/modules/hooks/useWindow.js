import { useCallback } from "react";

export default function useWindow(callback,deps) {
    useCallback(()=>{
        if(typeof window !== "undefined"){
            callback();
        }
    },deps)
}