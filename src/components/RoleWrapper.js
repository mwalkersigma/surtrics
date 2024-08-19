import {useSession} from "next-auth/react";
import useAdminList from "../modules/hooks/useAdminList";
import {Container, Text, Title} from "@mantine/core";
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
function Loading(){
    return <Container><h2>Loading</h2></Container>;
}
function Unauthorized(){
    return <Container>
        <Title className={"text-center"}>Not an Authorized User.</Title>
        <Text className={"text-center"}>If you feel like you should be reach out to michael walker</Text>
    </Container>;

}
function RoleWrapper({children,altRoles,invisible,LoadingComponent = <Loading/>}){
    const {data:session, status} = useSession();
    const {adminList, isAdmin,isRole} = useAdminList();
    if(altRoles && altRoles.includes("loggedIn")){
        if (invisible && (status === "unauthenticated" || status === 'loading')) return null;
        if(status === "loading") return<>{LoadingComponent}</>  ;
        if(status === "unauthenticated")return <Container><Title>Not logged in</Title></Container>;
        return children;
    }
    if(invisible)return <RoleWrapperInvisible altRoles={altRoles}>{children}</RoleWrapperInvisible>
    if(status === "loading" || !adminList ) return<>{LoadingComponent}</>  ;
    if(status === "error") return <Container><Title>Error</Title></Container>;
    if(!session)return <Container><Title>Not logged in</Title></Container>;
    if(Array.isArray(altRoles)) {
        let hasAuthorizedRole = altRoles.map(role => isRole(role)(session)).includes(true);
        if (!isAdmin(session) && !hasAuthorizedRole) return <Unauthorized/>;
        return children;
    }
    if(isAdmin(session) || (altRoles && isRole(altRoles)(session))) return children;
    return <Unauthorized/>;
}

export default RoleWrapper;