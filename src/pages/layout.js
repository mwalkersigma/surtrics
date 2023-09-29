import {createContext, useEffect, useState,useRef} from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {NavDropdown, Nav} from "react-bootstrap";
import useNav from "../modules/hooks/useNav";
import NavBar from "../components/NavBar";

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





export default function Layout({ children }) {
    const [theme, setTheme] = useState();
    const [sunday, setSunday] = useState(false);
    const intervalRef = useRef();

    const hasNavBar = useNav();
    useEffect(() => {
        if(typeof window === 'undefined') return;
        const preferredTheme = getPreferredTheme()
        setTheme(preferredTheme)
        setStoredTheme(preferredTheme)
        setDomTheme(preferredTheme)
        let twentyFourHours = 1000 * 60 * 60 * 24;
        intervalRef.current = setInterval(() => {
            window.location.reload();
        }, twentyFourHours);
        return () => clearInterval(intervalRef.current);
    }, [])
    function handleSetTheme(theme) {
        setTheme(theme)
        setStoredTheme(theme)
        setDomTheme(theme)
    }
    return (
        <>
        { hasNavBar && <NavBar theme={theme} setTheme={handleSetTheme} day={sunday} setDay={setSunday} />}
            <SundayContext.Provider value={sunday}>
            <ThemeContext.Provider value={theme}>
            <div className="main-wrapper" style={{minHeight:"87vh"}}>{children}</div>
            </ThemeContext.Provider>
            </SundayContext.Provider>
        </>
    )
}