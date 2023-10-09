import {Button, Image, Nav, NavDropdown, Stack} from "react-bootstrap";
import {signIn, signOut} from "next-auth/react";

export default function SignInComponent({session,isAdmin}){
    if(!session) return(
        <Button onClick={()=>signIn("google")}>Sign In</Button>
    )
    return(
        <>
            <NavDropdown title={session.user.name} id="basic-nav-dropdown">
                <NavDropdown.Item>
                    <Stack direction={"horizontal"}>
                        <Image className={"mx-auto"} src={session.user.image} alt={"user image"} roundedCircle height={50} referrerPolicy="no-referrer" />
                        <NavDropdown.ItemText className={"text-center"}>{isAdmin?"Admin":"User"}</NavDropdown.ItemText>
                    </Stack>
                </NavDropdown.Item>
                <NavDropdown.Divider/>
                <NavDropdown.Item>
                    <Nav.Item onClick={() => signOut()}>Sign Out</Nav.Item>
                </NavDropdown.Item>
            </NavDropdown>
        </>
    )
}