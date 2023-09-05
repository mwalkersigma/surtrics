import React from "react";

export default function InfoCard ({title,children,subtitle,theme,style}) {
    return(
        <div style={style} className={`info-card ${theme}`}>
            <div>{title}</div>
            <div className={"info"}>
                {children}
            </div>
            <small>{subtitle}</small>
        </div>
    )
}