import {AgGridReact} from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-enterprise";
import {colorSchemeDark, themeQuartz} from '@ag-grid-community/theming';
import {LicenseManager} from "ag-grid-enterprise";
import {Center, NumberFormatter} from "@mantine/core";
import {IconCircleCheck, IconCircleX} from "@tabler/icons-react";
import React, {useMemo} from "react";
import {format} from "date-fns";

LicenseManager.setLicenseKey("Using_this_{AG_Grid}_Enterprise_key_{AG-069767}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{SIGMA_Equipment}_is_granted_a_{Multiple_Applications}_Developer_License_for_{2}_Front-End_JavaScript_developers___All_Front-End_JavaScript_developers_need_to_be_licensed_in_addition_to_the_ones_working_with_{AG_Grid}_Enterprise___This_key_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{18_October_2025}____[v3]_[01]_MTc2MDc0MjAwMDAwMA==13c64523995c7964c46c29a5380bf0f9")

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