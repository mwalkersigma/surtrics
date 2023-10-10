import {useSession} from "next-auth/react";
import useAdminList from "../modules/hooks/useAdminList";
import Container from "react-bootstrap/Container";
import React from "react";

function RoleWrapperInvisible({children,altRoles}){
    const {data:session, status} = useSession();
    const {adminList, isAdmin,isRole} = useAdminList();
    if(status === "loading" || !adminList )return null;
    if(status === "error") return null;
    if(!session)return null;
    if(Array.isArray(altRoles)){
        let hasAuthorizedRole = altRoles.map(role=>isRole(role)(session)).includes(true);
        if(!isAdmin(session) && !hasAuthorizedRole) return null;
        return children;
    }
    if(isAdmin(session) || (altRoles && isRole(altRoles)(session))) return children;
}
function RoleWrapper({children,altRoles,invisible}){
    const {data:session, status} = useSession();
    const {adminList, isAdmin,isRole} = useAdminList();
    if(invisible)return <RoleWrapperInvisible altRoles={altRoles}>{children}</RoleWrapperInvisible>
    if(status === "loading" || !adminList )return<Container><h2>Loading</h2></Container>;
    if(status === "error") return <Container><h2>Error</h2></Container>;
    if(!session)return <Container><h2>Not logged in</h2></Container>;
    console.log("here")
    if(Array.isArray(altRoles)) {
        let hasAuthorizedRole = altRoles.map(role => isRole(role)(session)).includes(true);
        if (!isAdmin(session) && !hasAuthorizedRole) return <Container><h2 className={"text-center"}>Not an Authorized User.</h2><p className={"text-center"}>If you feel like you should be reach out to michael walker</p></Container>;
    }
    if(isAdmin(session) || (altRoles && isRole(altRoles)(session))) return children;
    return <Container><h2 className={"text-center"}>Not an Authorized User.</h2><p className={"text-center"}>If you feel like you should be reach out to michael walker</p></Container>;
}

export default RoleWrapper;