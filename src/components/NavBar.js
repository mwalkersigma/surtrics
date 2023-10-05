import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {Button, Image, Nav, NavDropdown, Stack} from "react-bootstrap";
import {signIn, signOut, useSession} from "next-auth/react";
import useAdminList from "../modules/hooks/useAdminList";



function SignInComponent({session,isAdmin}){
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

export default function NavBar({theme,setTheme,setDay}){
    const {data: session} = useSession();
    let {isAdmin} = useAdminList();
    isAdmin = isAdmin(session);
    return (
        <Navbar data-bs-theme="dark" className="bg-body-tertiary mb-5">
            <Container>
                <Navbar.Toggle />
                <Nav>
                    <Navbar.Brand href="/">Surplus Metrics</Navbar.Brand>
                    <NavDropdown title={"Graphs"} id="basic-nav-dropdown">
                        <Nav.Link href="/graphs/yearlyView">Yearly View</Nav.Link>
                        <Nav.Link href="/graphs/monthlyView">Monthly View</Nav.Link>
                        <Nav.Link href="/graphs/weeklyView">Weekly View</Nav.Link>
                        <Nav.Link href="/graphs/dailyView">Daily View</Nav.Link>
                        <Nav.Link href="/graphs/individualGraph">User View</Nav.Link>
                    </NavDropdown>

                    <NavDropdown title={"Tables"} id="basic-nav-dropdown">
                        <Nav.Link href="/tables/individualView">Individual View</Nav.Link>
                        <Nav.Link href="/tables/quantityView">Quantity View</Nav.Link>
                        <Nav.Link href="/tables/warehousePicks">Warehouse Picks</Nav.Link>
                        <Nav.Link href="/tables/approvalsView">Approvals View</Nav.Link>
                    </NavDropdown>
                    {isAdmin && (
                        <NavDropdown title={"Admin"} id="basic-nav-dropdown">
                            <Nav.Link href={"/admin"}>Admin</Nav.Link>
                            <Nav.Link href={"/admin/errorReporting"}>Report Error</Nav.Link>
                            <Nav.Link href={"/admin/errorViewer"}>Error Viewer</Nav.Link>
                        </NavDropdown>
                    )}
                </Nav>
                <Nav>
                    <NavDropdown className={`text-white`} title=" Theme " id="basic-nav-dropdown">
                        <NavDropdown.Item>
                            {theme === 'dark' ?
                                ( <Nav.Item onClick={() => setTheme('light')}>Light Mode</Nav.Item> ) :
                                ( <Nav.Item onClick={() => setTheme('dark')}>Dark Mode</Nav.Item> ) }
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item>
                            <Nav.Item onClick={() => setDay(false)}>Monday Start</Nav.Item>
                        </NavDropdown.Item>
                        <NavDropdown.Item>
                            <Nav.Item onClick={() => setDay(true)}>Sunday Start</Nav.Item>
                        </NavDropdown.Item>
                    </NavDropdown>
                    <SignInComponent session={session} isAdmin={isAdmin} />
                </Nav>
            </Container>
        </Navbar>
    )
}