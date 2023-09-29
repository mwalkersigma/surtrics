import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {Nav, NavDropdown} from "react-bootstrap";

export default function NavBar({theme,setTheme,setDay}){
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
                        {/*<Nav.Link href="/tables/yearlyView">Yearly View</Nav.Link>*/}
                        {/*<Nav.Link href="/tables/monthlyView">Monthly View</Nav.Link>*/}
                        {/*<Nav.Link href="/tables/weeklyView">Weekly View</Nav.Link>*/}
                        {/*<Nav.Link href="/tables/dailyView">Daily View</Nav.Link>*/}
                        <Nav.Link href="/tables/individualView">Individual View</Nav.Link>
                        <Nav.Link href="/tables/quantityView">Quantity View</Nav.Link>
                    </NavDropdown>




                </Nav>
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
            </Container>
        </Navbar>
    )
}