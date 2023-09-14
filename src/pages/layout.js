import {createContext, useEffect, useState} from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {NavDropdown, Nav} from "react-bootstrap";

let getStoredTheme,setStoredTheme,getPreferredTheme,setDomTheme;
export const ThemeContext = createContext('light');
export const SundayContext = createContext(false);

if(typeof window !== 'undefined') {
    getStoredTheme = () => localStorage.getItem('theme');
    setStoredTheme = theme => localStorage.setItem('theme', theme);
    getPreferredTheme = () => {
        const storedTheme = getStoredTheme()
        if (storedTheme) {
            return storedTheme
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    setDomTheme = theme => {
        if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-bs-theme', 'dark')
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme)
        }
    }
}
function NavBar({theme,setTheme,setDay}){
    return (
        <Navbar data-bs-theme="dark" className="bg-body-tertiary mb-5">
            <Container>
                <Navbar.Toggle />
                <Nav>
                    <Navbar.Brand href="/">Surplus Metrics</Navbar.Brand>
                    <NavDropdown title={"Graphs"} id="basic-nav-dropdown">
                        <Nav.Link href="/graphs/monthlyView">Monthly View</Nav.Link>
                        <Nav.Link href="/graphs/weeklyView">Weekly View</Nav.Link>
                        <Nav.Link href="/graphs/dailyView">Daily View</Nav.Link>
                    </NavDropdown>
                    <Nav.Link href="/individualView">Individual View</Nav.Link>
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




export default function Layout({ children }) {
    const [theme, setTheme] = useState();
    const [sunday, setSunday] = useState(false);
    useEffect(() => {
        if(typeof window === 'undefined') return;
        const preferredTheme = getPreferredTheme()
        setTheme(preferredTheme)
        setStoredTheme(preferredTheme)
        setDomTheme(preferredTheme)
    }, [])
    function handleSetTheme(theme) {
        setTheme(theme)
        setStoredTheme(theme)
        setDomTheme(theme)
    }
    return (
        <>
            <NavBar theme={theme} setTheme={handleSetTheme} day={sunday} setDay={setSunday} />
            <SundayContext.Provider value={sunday}>
            <ThemeContext.Provider value={theme}>
            <div className="main-wrapper" style={{minHeight:"87vh"}}>{children}</div>
            </ThemeContext.Provider>
            </SundayContext.Provider>
        </>
    )
}