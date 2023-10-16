import {useEffect, useRef, useState} from "react";

export default function useUpdates(route, routeOptions){
    const interval = routeOptions?.interval || 1000 * 60;
    const intervalRef = useRef(null);
    const [serverData, setServerData] = useState([])

    routeOptions = JSON.stringify(routeOptions || {})
    useEffect(() => {
        let options = {};
        if(routeOptions){
            options = {
                method: "POST",
                body: routeOptions,
            }
        }
        const getTransactions = () => fetch(`${window.location.origin}${route}`,options)
            .then((response) => response.json())
            .then((data) => setServerData(data))
            .finally(() => console.log("updated",routeOptions));

        getTransactions()
            .catch((error) => console.log(error))

        intervalRef.current = setInterval(getTransactions, interval || 1000 * 60 )
        return () => clearInterval(intervalRef.current)

    }, [route,routeOptions,interval])
    return serverData
}