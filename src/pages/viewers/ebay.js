import React, {useEffect, useState} from 'react';
import Container from "react-bootstrap/Container";
import useUpdates from "../../modules/hooks/useUpdates";
import Table from "react-bootstrap/Table";
import {format} from "date-fns";
import formatter from "../../modules/utils/numberFormatter";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import {toHeaderCase} from "js-convert-case"

function useTableHandle(initialState, idField) {
    const [tableData, setTableData] = useState(initialState);
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    function removeHandler (endpoint) {
      return (id) => fetch(`${window.location.origin}${endpoint}`,{
            method:"DELETE",
            body:JSON.stringify({id})
        }).then(data=>{
            setTableData(tableData.filter((row)=>row.id !== id));
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

const EbayDataViewer = () => {
    const update = useUpdates("/api/dataEntry/ebay")
    const {tableData, setTableData, headers,rows,removeHandler, updateHandler} = useTableHandle(update,"entry_id");

    const handleRemove = removeHandler("/api/dataEntry/ebay");

    return (
        <Container>
            <Table striped bordered hover className={"text-center"}>
                <thead>
                    <tr>
                        {headers?.map((header) => (
                            <th key={header.displayName}>{header.displayName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows?.map((row) => (
                        <tr key={row.id}>
                            <td>
                                {row.id}
                            </td>
                            <td>
                                {formatter(row.impressions)}
                            </td>
                            <td>
                                {formatter(row.page_views)}
                            </td>
                            <td>
                                {format(new Date(row.date_for_week),"MM/dd/yyyy")}
                            </td>
                            <td>
                                <Stack>
                                    <Button onClick={()=>handleRemove(row.id)} variant={'outline-danger'}>Remove</Button>
                                </Stack>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default EbayDataViewer;