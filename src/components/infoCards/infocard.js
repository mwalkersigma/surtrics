import React from "react";
import {colorScheme} from "../../pages/_app";

export default function InfoCard ({title,children,subtitle,theme,style,formatter}) {
    let formatterCurry = (children) => {
        if(!formatter) return theme === "dark" ? colorScheme.light : colorScheme.dark;
        let value = +children
        if(typeof value === "number" && !isNaN(value)) {
            return formatter(value) ? colorScheme.green : colorScheme.red;
        }
        return theme === "dark" ? colorScheme.light : colorScheme.dark;
    }
    return(
        <div style={style} className={`info-card themed-border themed-drop-shadow ${theme}`}>
            <div>{title}</div>
            <div style={{
                color: formatterCurry(children)
            }} className={"info"}>
                {children}
            </div>
            <small>{subtitle}</small>
        </div>
    )
}