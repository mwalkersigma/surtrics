import React from "react";

export default function BigInfoCard ({title,children,subtitle,theme}) {
    return(
        <div className={`big info-card ${theme}`}>
            <div>{title}</div>
            <div className={"info"}>
                {children}
            </div>
            <small>{subtitle}</small>
        </div>
    )
}