import {useEffect, useState} from "react";
import {toHeaderCase} from "js-convert-case";

export default function useTableHandle(initialState, idField) {
    const [tableData, setTableData] = useState(initialState);
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    function removeHandler (endpoint) {
        return (id) => fetch(`${window.location.origin}${endpoint}`,{
            method:"DELETE",
            body:JSON.stringify({id})
        }).then(data=>{
            let temp = tableData.filter((row)=>row[idField] !== id);
            console.log(temp)
            setTableData(temp);
            return data;
        })
    }
    function updateHandler(endpoint){
        return (id) => (field) => (value) => {
            return fetch(`${window.location.origin}/api/dataEntry/ebay`,{
                method:"PATCH",
                body:JSON.stringify({id,field,value})
            }).then(data=>{
                setTableData(tableData.map((row)=>{
                    if(row.id === id){
                        row[field] = value;
                    }
                    return row;
                }));
                return data;
            })
        }
    }

    useEffect(() => {
        console.log("Table rows and headers updated")
        let temp = new Set();
        if(!tableData?.length)return;
        Object.keys(tableData[0])
            .map((key) => ({keyName: key, displayName: toHeaderCase(key)}))
            .map(item=>JSON.stringify(item))
            .forEach(item => temp.add(item));
        let tempHeaders = Array.from(temp).map(item=>JSON.parse(item));
        let tempRows = tableData.map(row => {
            let tempRow = {
                id:row[idField]
            };
            tempHeaders.forEach(header => {
                tempRow[header.keyName] = row[header.keyName];
            })
            return tempRow;
        });
        setHeaders(Array.from(temp).map(item=>JSON.parse(item)));
        setRows(tempRows);
    }, [tableData]);

    useEffect(() => {
        setTableData(initialState);
    }, [initialState]);

    return {tableData, setTableData, headers, rows, removeHandler, updateHandler};

}