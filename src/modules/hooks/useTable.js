import useUpdates from "./useUpdates";
import {useListState} from "@mantine/hooks";
import {Notifications} from "@mantine/notifications";
import {useEffect} from "react";

export default function useTable ({route,idField,options}) {
    const updates = useUpdates(route,options);
    const [tableData, handlers] = useListState(updates);

    function removeHandler (endpoint) {
        return (id) => fetch(`${window.location.origin}${endpoint}`,{
            method:"DELETE",
            body:JSON.stringify({[idField]:id})
        })
            .then(res=>res.json())
            .then((res) => Notifications.show({title: "Success", message: res}))
            .then(data=>{
                let temp = tableData.filter((row)=>row[idField] !== id);
                handlers.setState(temp);
                return data;
            })
            .catch((err) => Notifications.show({title: "Error", message: err}))


    }

    function updateHandler(endpoint){
        return (id) => (field) => (value) => {
            return fetch(`${window.location.origin}${endpoint}`,{
                method:"PATCH",
                body:JSON.stringify({id,field,value})
            }).then(data=>{
                handlers.setState(tableData.map((row)=>{
                    if(row[idField] === id){
                        row[field] = value;
                    }
                    return row;
                }));
                return data;
            })
        }
    }

    useEffect(() => {
        handlers.setState(updates);
    }, [updates]);

    const status = tableData.length === 0 ? "loading" : "Ready";

    return {tableData, handlers, status, removeHandler, updateHandler};
}