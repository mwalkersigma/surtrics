import {useEffect, useRef, useState} from "react";

export default function useUpdates(route, interval = 1000 * 60){
    const intervalRef = useRef(null);
    const [serverData, setServerData] = useState([])


    useEffect(() => {
        const getTransactions = () => fetch(`${window.location.origin}${route}`)
            .then((response) => response.json())
            .then((data) => setServerData(data));

        getTransactions()
            .catch((error) => console.log(error))

        intervalRef.current = setInterval(getTransactions, interval)

        return () => clearInterval(intervalRef.current)

    }, [route,interval])
    return serverData
}