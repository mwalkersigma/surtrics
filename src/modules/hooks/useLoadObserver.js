import {useEffect, useState} from "react";
import LoadObserver from "../classes/loadObserver";

export default function useLoadObserver({initialValues, setup}) {
    const [loadingObserver, setLoadingObserver] = useState(new LoadObserver());
    if (loadingObserver.dataState === null) {
        loadingObserver.registerStateAndDataObject(initialValues)
        setup(loadingObserver);
    }
    useEffect(() => {
        console.log("Hooked Mounted")
        return () => {
            console.log("Cleaning Up Load Observer")
            setLoadingObserver(new LoadObserver());
        }
    }, [])
    return loadingObserver;
}