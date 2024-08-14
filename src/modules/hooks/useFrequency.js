import {useQuery} from "@tanstack/react-query";


export default function useFrequency(){
    const {data: frequency} = useQuery({
        queryKey: ["frequency"],
        queryFn: async () => {
            return fetch("/api/getFrequency")
                .then(res => res.json())
        },
    })
}