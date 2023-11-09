import {useEffect, useRef, useState} from "react";

export default function useUpdates(route, routeOptions) {
    const intervalRef = useRef(null);
    const [serverData, setServerData] = useState([])

    if (routeOptions) {
        routeOptions = JSON.stringify(routeOptions || {})
    }
    else {
        routeOptions = false
    }
    useEffect(() => {
        let options = {};
        if(routeOptions){
            options = {
                method: "POST",
                body: routeOptions,
            }
        }
        console.log("updating",routeOptions)
        const getTransactions = () => fetch(`${window.location.origin}${route}`,options)
            .then((response) => response.json())
            .then((data) => setServerData(data))
            .finally(() => console.log("updated",routeOptions));

        getTransactions()
            .catch((error) => console.log(error))

        intervalRef.current = setInterval(getTransactions, 1000 * 60 )
        return () => clearInterval(intervalRef.current)

    }, [route,routeOptions])
    return serverData
}