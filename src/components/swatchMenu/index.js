import {SplitButton} from "../splitButton/SplitButton";
import {ColorSwatch, Text} from "@mantine/core";
import React from "react";

export default function SwatchMenu({metricKey, color, clickHandler, label, menuItems}) {
    return (
        <SplitButton
            tooltip={label}
            variant={'subtle'}
            color={'gray'}
            buttonProps={{
                leftSection: <ColorSwatch color={color}/>,
                onClick: clickHandler,
            }}
            menuProps={{
                trigger: 'click-hover',
                closeOnItemClick: false,
            }}
            menuItems={menuItems}
        >
            <Text> {metricKey} </Text>
        </SplitButton>
    )
}