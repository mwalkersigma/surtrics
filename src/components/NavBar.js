import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {Nav, NavDropdown} from "react-bootstrap";
import {useSession} from "next-auth/react";
import useAdminList from "../modules/hooks/useAdminList";
import RoleWrapper from "./RoleWrapper";
import SignInComponent from "./SignInComponent";

{/*<NavDropdown.ItemText>Graphs</NavDropdown.ItemText>*/}
{/*<NavDropdown.Divider />*/}
{/*<NavDropdown.Divider />*/}
// <NavDropdown.ItemText>Tables</NavDropdown.ItemText>
// <NavDropdown.Divider />

export default function NavBar({theme,setTheme,setDay}){
    const {data: session} = useSession();
    let {isAdmin,getRoles,isRole} = useAdminList();
    const isRanda = isRole("Randa")(session);
    let roles = getRoles(session);
    isAdmin = isAdmin(session);
    return (
        <Navbar data-bs-theme="dark" className="bg-body-tertiary mb-5">
            <Container>
                <Navbar.Toggle />
                <Nav>
                    <Navbar.Brand href="/">Surplus Metrics</Navbar.Brand>

                    <NavDropdown title={"Increments"}>
                        <NavDropdown.ItemText>Graphs</NavDropdown.ItemText>
                        <NavDropdown.Divider />
                        <Nav.Link href="/graphs/yearlyView">Yearly View</Nav.Link>
                        <Nav.Link href="/graphs/monthlyView">Monthly View</Nav.Link>
                        <Nav.Link href="/graphs/weeklyView">Weekly View</Nav.Link>
                        <Nav.Link href="/graphs/dailyView">Daily View</Nav.Link>
                    </NavDropdown>

                    <NavDropdown title={"Approvals"}>
                        <NavDropdown.ItemText>Graphs</NavDropdown.ItemText>
                        <NavDropdown.Divider />
                        <Nav.Link href="/graphs/approvalsOverYear">Yearly View</Nav.Link>
                        <Nav.Link href="/graphs/ApprovalsStackedWeek">Weekly View</Nav.Link>
                        <NavDropdown.Divider />
                        <NavDropdown.ItemText>Tables</NavDropdown.ItemText>
                        <NavDropdown.Divider />
                        <Nav.Link href="/tables/approvalsView">Weekly View</Nav.Link>
                    </NavDropdown>

                    <NavDropdown title={"Quantity"}>
                        <NavDropdown.ItemText>Tables</NavDropdown.ItemText>
                        <NavDropdown.Divider />
                        <Nav.Link href="/tables/quantityView">Weekly View</Nav.Link>
                    </NavDropdown>

                    <NavDropdown title={"Individual"}>
                        <NavDropdown.ItemText>Graphs</NavDropdown.ItemText>
                        <NavDropdown.Divider />
                        <Nav.Link href="/graphs/individualGraph">Daily View</Nav.Link>
                        <NavDropdown.Divider />
                        <NavDropdown.ItemText>Tables</NavDropdown.ItemText>
                        <NavDropdown.Divider />
                        <Nav.Link href="/tables/individualView">Daily View</Nav.Link>
                    </NavDropdown>

                    <NavDropdown title={"Warehouse"}>
                        <NavDropdown.ItemText>Tables</NavDropdown.ItemText>
                        <NavDropdown.Divider />
                        <Nav.Link href="/tables/warehousePicks">Weekly View</Nav.Link>
                    </NavDropdown>

                    <RoleWrapper invisible altRoles={"bsa"}>
                        <NavDropdown title={"Data Entry"}>
                            <Nav.Link href="/BSA/BigCommerceEntry">Big Commerce</Nav.Link>
                            <Nav.Link href="/BSA/EbayEntry">Ebay</Nav.Link>
                        </NavDropdown>
                    </RoleWrapper>

                    <RoleWrapper invisible altRoles={"surplus director"}>
                        <NavDropdown title={"Admin"} id="basic-nav-dropdown">
                            <Nav.Link href={"/admin"}>Admin</Nav.Link>
                            <Nav.Link href={"/admin/errorReporting"}>Submit Error</Nav.Link>
                            <Nav.Link href={"/admin/errorViewer"}>Error View</Nav.Link>
                        </NavDropdown>
                    </RoleWrapper>

                </Nav>
                <Nav>
                    <NavDropdown className={`text-white`} title=" Theme " id="basic-nav-dropdown">
                        <NavDropdown.Item>
                            {theme === 'dark' ?
                                ( <Nav.Item onClick={() => setTheme('light')}>Light Mode</Nav.Item> ) :
                                ( <Nav.Item onClick={() => setTheme('dark')}>Dark Mode</Nav.Item> ) }
                        </NavDropdown.Item>
                    </NavDropdown>
                    <SignInComponent session={session} isAdmin={isAdmin} role={roles[0]} isRanda={isRanda}  />
                </Nav>
            </Container>
        </Navbar>
    )
}