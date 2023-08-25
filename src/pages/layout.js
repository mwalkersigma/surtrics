import {useEffect, useState} from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {NavDropdown, Nav} from "react-bootstrap";

let getStoredTheme,setStoredTheme,getPreferredTheme,setDomTheme;

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
function NavBar({theme,setTheme}){
    return (
        <Navbar data-bs-theme="dark" className="bg-body-tertiary mb-5">
            <Container>
                <Navbar.Toggle />
                <Nav>
                    <Navbar.Brand href="#home">Surplus Metrics</Navbar.Brand>
                    <Nav.Link href="/weeklyView">Weekly View</Nav.Link>
                </Nav>
                <NavDropdown className={`text-white`} title=" Theme " id="basic-nav-dropdown">
                    <NavDropdown.Item>
                        {theme === 'dark' ?
                            ( <Nav.Item onClick={() => setTheme('light')}>Light Mode</Nav.Item> ) :
                            ( <Nav.Item onClick={() => setTheme('dark')}>Dark Mode</Nav.Item> ) }
                    </NavDropdown.Item>
                </NavDropdown>
            </Container>
        </Navbar>
    )
}
export default function Layout({ children }) {
    const [theme, setTheme] = useState();
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
    console.log(theme)
    return (
        <>
            <NavBar theme={theme} setTheme={handleSetTheme} />
            <div className="main-wrapper" style={{minHeight:"87vh"}}>{children}</div>
        </>
    )
}