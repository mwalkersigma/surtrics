import {useSession} from "next-auth/react";
import useAdminList from "../modules/hooks/useAdminList";
import Container from "react-bootstrap/Container";
import React from "react";

function AdminWrapper({children}){
    const {data:session, status} = useSession();
    const {adminList, isAdmin} = useAdminList();
    if(status === "loading" || !adminList )return<Container><h2>Loading</h2></Container>;
    if(status === "error") return <Container><h2>Error</h2></Container>;
    if(!session)return <Container><h2>Not logged in</h2></Container>;
    if(!isAdmin(session)) return(<Container><h2 className={"text-center"}>Not an admin.</h2><p>If you feel like you should be reach out to michael walker</p></Container>);
    return children;
}

export default AdminWrapper;