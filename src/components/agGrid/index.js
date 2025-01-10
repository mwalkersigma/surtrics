import {AgGridReact} from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-enterprise";
import {colorSchemeDark, themeQuartz} from '@ag-grid-community/theming';

import {LicenseManager} from "ag-grid-enterprise";
import {Box, Button, Center, NumberFormatter} from "@mantine/core";
import {IconCircleCheck, IconCircleX, IconTrash} from "@tabler/icons-react";
import React, {forwardRef, useCallback, useMemo, useRef} from "react";
import {format, startOfMonth} from "date-fns";
import {mergeRefs} from "../../modules/utils/helpers";

LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE)

function ButtonRenderer({label, onClick, data}) {
    return <Center h={'100%'}><Button size={'xs'} onClick={() => onClick(data)}>{label}</Button></Center>
}

function DateRenderer(props) {
    const {value, grouped, notCentered} = props;
    try {
        if (value === undefined) return ""
        if( value === null ) return ""
        let Wrapper = notCentered ? Box : Center;
        if( grouped ) {
            return <Wrapper h={'100%'}>{format(startOfMonth(new Date(value)), "P")}</Wrapper>;
        }

        return <Wrapper h={'100%'}>{format(new Date(value), "P")}</Wrapper>;
    }
    catch (e) {
        console.error(e);
        console.error(value);
        return <Wrapper h={'100%'}>Invalid Date</Wrapper>
    }
}

export function MoneyRenderer({ value }) {
    if (value === null) return "Not Provided"
    return <NumberFormatter
        decimalScale={2}
        thousandSeparator
        value={value}
        prefix={'$'}
    />
}

export function BooleanRenderer({ value }) {
    if (value === undefined || value === null) return "";
    return value ? <IconCircleCheck color={'var(--mantine-color-green-5)'}/> :
        <IconCircleX color={'var(--mantine-color-red-5)'}/>
}

function CenteredBooleanRenderer({value}) {
    if (value === undefined || value === null) return "";
    return <Center h={'100%'}>{value ? <IconCircleCheck color={'var(--mantine-color-green-5)'}/> :
        <IconCircleX color={'var(--mantine-color-red-5)'}/>}</Center>;
}

function PercentageRenderer({value}) {
    return <NumberFormatter
        decimalScale={2}
        thousandSeparator
        suffix={'%'}
        value={value * 100}
    />
}

const RemoveRenderer = (props) => {
    return (
        <IconTrash
            style={{ cursor: "pointer" }}
            size={'1rem'}
            onClick={() => {
                switch ( props.node.group ) {
                    case true:
                        props.api.applyTransaction({
                            remove: [...props.node.allLeafChildren, ...props.node.childrenAfterFilter, props.node.data]
                        })

                        break;
                    default:
                        props.api.applyTransaction({
                            remove: [props.node.data]
                        })
                }
            }}
        />
    )
}
const isSameValues = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isSameColumn = (a, b) => a.colId === b.colId;
const pluckFromPath = (obj, names) => names.reduce((o, n) => (o || {}) [n], obj)


function findColumnPath(defs, oldFirstColumn) {
    let path = [];
    for ( let i = 0; i < defs.length; i++ ) {
        let column = defs[i];
        let isGroup = column?.children?.length > 0;
        if( isGroup ) {
            let children = column.children;
            let subPath = findColumnPath(children, oldFirstColumn);
            if( subPath ) {
                path.push(i);
                path.push("children");
                path.push(...subPath);
                return path;
            }
            continue;
        }
        let sameColumn = isSameColumn(column, oldFirstColumn);
        if( sameColumn ) {
            path.push(i);
            return path;
        }
    }
    return null;
}

function depthFirstSearch(arr, callback) {
    function searchRecursive(obj, path) {
        // Base case: if callback returns true, return the current path
        if( callback(obj) ) return path;

        // Recursively search through nested objects and arrays
        if( Array.isArray(obj) ) {
            for ( let i = 0; i < obj?.length; i++ ) {
                const result = searchRecursive(obj[i], [...path, Number(i)]);
                if( result ) return result;
            }
        }
        else if( typeof obj === 'object' && obj !== null ) {
            for ( let key in obj ) {
                if( obj.hasOwnProperty(key) ) {
                    const result = searchRecursive(obj[key], [...path, key]);
                    if( result ) return result;
                }
            }
        }

        return null; // Return null if no path is found
    }

    // Start searching from the root of the array with an empty path
    for ( let i = 0; i < arr.length; i++ ) {
        const result = searchRecursive(arr[i], [i]);
        if( result ) return result;
    }

    return null; // Return null if the callback never returns true
}


function BaseGrid(allProps, ref) {
    const components = useMemo(() => ({
        MoneyRenderer,
        BooleanRenderer,
        DateRenderer,
        PercentageRenderer,
        CenteredBooleanRenderer,
        ButtonRenderer,
        RemoveRenderer
    }), []);
    const localRef = useRef(null);
    const firstColumnRef = useRef(null);
    const firstColumnPreviousRenderer = useRef(null);

    const customTheme = useMemo(() => themeQuartz
        .withPart(colorSchemeDark)
        .withParams({
            headerHeight: 40,
            fontFamily: "inherit",
            headerFontSize: 14,
            oddRowBackgroundColor: "#242424"
        }), []);

    const { props, autoUpdateMasterDetail, onGridReady } = useMemo(() => {
        const { autoUpdateMasterDetail, onGridReady, ...defProps } = allProps;
        let props = defProps;
        return { props, autoUpdateMasterDetail, onGridReady };
    }, [allProps]);

    const handleUpdate = useCallback((params) => {
        if( !autoUpdateMasterDetail ) return;
        let api = params.api;
        let columnDefs = api.getColumnDefs();
        let oldFirstColumn = firstColumnRef.current;
        let path = findColumnPath(columnDefs, oldFirstColumn);
        let newPath = depthFirstSearch(
            columnDefs,
            (item) => {
                let hasColId = item?.colId
                if( !hasColId ) return false;
                let column = api.getColumn(hasColId);
                let parent = column.getParent();
                if( !parent ) return true;
                let displayedChildren = parent?.displayedChildren;
                let firstChild = displayedChildren[0];
                let left = firstChild?.left === 0;
                if( !left ) return false;
                return isSameColumn(column, firstChild);

            }
        )
        let state = api.getState();
        let hasGroupedRows = state?.rowGroup
        if( !path ) {
            console.log("No Path Found");
            return;
        }
        oldFirstColumn = pluckFromPath(columnDefs, path);
        if( hasGroupedRows ) {
            let previousRenderer = firstColumnPreviousRenderer.current ?? undefined;
            let isOldRenderer = oldFirstColumn.cellRenderer === previousRenderer && previousRenderer !== "agGroupCellRenderer";
            let isGroupRenderer = oldFirstColumn.cellRenderer === 'agGroupCellRenderer';
            if( !isOldRenderer || isGroupRenderer ) {
                oldFirstColumn.cellRenderer = previousRenderer;
                api.setGridOption("columnDefs", columnDefs)
                return;
            }
            return;
        }

        if( oldFirstColumn.cellRenderer !== 'agGroupCellRenderer' ) {
            oldFirstColumn.cellRenderer = 'agGroupCellRenderer';
            api.setGridOption("columnDefs", columnDefs);
            return;
        }
        if( !newPath ) return;
        if( isSameValues(path, newPath) ) return;
        oldFirstColumn = pluckFromPath(columnDefs, path);
        oldFirstColumn.cellRenderer = firstColumnPreviousRenderer.current;
        let newFirstColumn = pluckFromPath(columnDefs, newPath);
        firstColumnPreviousRenderer.current = newFirstColumn?.cellRenderer ?? undefined;
        newFirstColumn.cellRenderer = 'agGroupCellRenderer';
        firstColumnRef.current = newFirstColumn;
        api.setGridOption("columnDefs", columnDefs)
    }, [firstColumnRef, autoUpdateMasterDetail]);
    const handleGridReady = useCallback((params) => {
        if( !autoUpdateMasterDetail ) return;
        console.log("Grid Ready", params);
        let columnDefs = params.api.getColumnDefs();
        let firstColumn = columnDefs[0];
        let isGroup = firstColumn?.children?.length > 0;
        if( isGroup ) {
            firstColumnRef.current = firstColumn.children[0];
            columnDefs[0].children[0].cellRenderer = 'agGroupCellRenderer';
        }
        else {
            firstColumnRef.current = firstColumn;
            columnDefs[0].cellRenderer = 'agGroupCellRenderer';
        }
        params.api.setGridOption("columnDefs", columnDefs)
        console.log("First Column", firstColumn);
    }, [firstColumnRef, autoUpdateMasterDetail]);

    const startUp = useCallback((params) => {
        let api = params.api;
        handleGridReady(params);
        if( onGridReady ) {
            onGridReady(params);
        }
        api.addEventListener('displayedColumnsChanged', handleUpdate);
        return () => {
            api.removeEventListener('displayedColumnsChanged', handleUpdate);
        }
    }, [handleUpdate, handleGridReady, onGridReady]);


    return <AgGridReact
        ref={mergeRefs(ref, localRef)}
        components={components}
        theme={customTheme}
        onGridReady={startUp}
        loadThemeGoogleFonts
        {...props}
    />
}

const DataGrid = forwardRef(BaseGrid)
export default DataGrid