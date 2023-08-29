import {useEffect, useRef, useState} from "react";

export default function useUpdates(route, init){
    const date = init?.date || null;
    const interval = init?.interval || 1000 * 60;
    const intervalRef = useRef(null);
    const [serverData, setServerData] = useState([])

    useEffect(() => {
        let options = {};
        if(date){
            options = {
                method: "POST",
                body: JSON.stringify({date}),
            }
        }
        const getTransactions = () => fetch(`${window.location.origin}${route}`,options)
            .then((response) => response.json())
            .then((data) => setServerData(data))
            .finally(() => console.log("done"));

        getTransactions()
            .catch((error) => console.log(error))

         intervalRef.current = setInterval(getTransactions, interval || 1000 * 60 )
         return () => clearInterval(intervalRef.current)

    }, [
        route,
        interval,
        date
    ])
    return serverData
}