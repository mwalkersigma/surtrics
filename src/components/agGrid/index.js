import {AgGridReact} from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-enterprise";
import {colorSchemeDark, themeQuartz} from '@ag-grid-community/theming';
import {LicenseManager} from "ag-grid-enterprise";
import {Center, NumberFormatter} from "@mantine/core";
import {IconCircleCheck, IconCircleX} from "@tabler/icons-react";
import React, {useMemo} from "react";
import {format} from "date-fns";

LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE)

function DateRenderer({value}) {
    try {
        if (value === undefined) return ""
        return <Center h={'100%'}>{format(new Date(value), "Pp")}</Center>;
    } catch (e) {
        console.error(e);
        console.error(value);
        return <Center h={'100%'}>Invalid Date</Center>
    }
}

function MoneyRenderer({value}) {
    if (value === null) return "Not Provided"
    return <NumberFormatter
        decimalScale={2}
        thousandSeparator
        value={value}
        prefix={'$'}
    />
}

function BooleanRenderer({value}) {
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

export default function DataGrid(props) {
    const components = useMemo(() => ({
        MoneyRenderer,
        BooleanRenderer,
        DateRenderer,
        PercentageRenderer,
        CenteredBooleanRenderer
    }), []);
    const customTheme = themeQuartz
        .withPart(colorSchemeDark)
        .withParams({
            headerHeight: 40,
            fontFamily: "inherit",
            headerFontSize: 14,
            oddRowBackgroundColor: "#242424"
        });
    return <AgGridReact components={components} theme={customTheme} loadThemeGoogleFonts {...props}/>
}