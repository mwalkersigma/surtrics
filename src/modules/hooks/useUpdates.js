import {useQuery} from "@tanstack/react-query";

export default function useUpdates(route, routeOptions) {
    let callOptions;
    if (routeOptions) {
        callOptions = Object.values(routeOptions).map(item => JSON.stringify(item))
    }
    else {
        callOptions = []
    }
    const {data, isPending} = useQuery({
        queryKey: [route, ...callOptions],
        queryFn: async () => {
            console.log("updated")
            const callOptions = {}
            if (routeOptions) {
                callOptions.method = "POST"
                callOptions.body = JSON.stringify(routeOptions)
                callOptions.headers = {
                    'Content-Type': 'application/json'
                }
            }
            return await fetch(route, callOptions).then(res => res.json())

        },
        refetchInterval: routeOptions?.interval ?? 1000 * 60
    });
    if (isPending) {
        return []
    }

    return data ? data : []
}
// export default function useUpdates(route, routeOptions) {
//     const intervalRef = useRef(null);
//     const [serverData, setServerData] = useState([])
//
//     if (routeOptions) {
//         routeOptions = JSON.stringify(routeOptions || {})
//     }
//     else {
//         routeOptions = false
//     }
//     useEffect(() => {
//         let options = {};
//         if(routeOptions){
//             options = {
//                 method: "POST",
//                 body: routeOptions,
//             }
//         }
//         const getTransactions = () => fetch(`${window.location.origin}${route}`,options)
//             .then((response) => response.json())
//             .then((data) => setServerData(data))
//             .finally(() => console.log("updated",routeOptions));
//         getTransactions()
//             .catch((error) => console.log(error))
//
//         intervalRef.current = setInterval(getTransactions, 1000 * 60 )
//         return () => clearInterval(intervalRef.current)
//
//     }, [route,routeOptions])
//     return serverData
// }