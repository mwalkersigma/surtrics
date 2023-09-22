import {useEffect, useState} from "react";

export default function useNav() {
    const [hasNavBar, setHasNavBar] = useState(true);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const urlParams = new URLSearchParams(window.location.search);
        const nav = urlParams.get('nav');
        if(nav === "false") setHasNavBar(false);
    }, []);
    return hasNavBar;
}