import {useEffect, useRef} from "react";
import {useDisclosure} from '@mantine/hooks';
import {
    AppShell, Text, ScrollArea, Space,
} from '@mantine/core';
import useNav from "../modules/hooks/useNav";
import SurtricsNavbar from "../components/mantine/layout/navbar";
import SurtricsHeader from "../components/mantine/layout/header";


export default function Layout({children}) {
    const hasNavBar = useNav();
    const intervalRef = useRef();
    const [mobileOpened, {toggle: toggleMobile}] = useDisclosure();
    const [desktopOpened, {toggle: toggleDesktop}] = useDisclosure(true);

    const appShellProps = {
        header: {height: 60}, padding: "md", navbar: {
            width: 300, breakpoint: 'sm', collapsed: {
                mobile: !mobileOpened, desktop: !desktopOpened
            },
        }
    }
    const toggleProps = {
        mobileOpened, toggleMobile, desktopOpened, toggleDesktop,
    }


    useEffect(() => {
        if (typeof window === 'undefined') return;
        let twentyFourHours = 1000 * 60 * 60 * 24;
        intervalRef.current = setInterval(() => {
            window.location.reload();
        }, twentyFourHours);
        return () => clearInterval(intervalRef.current);
    }, []);

    if (!hasNavBar) return children;
    return (<AppShell {...appShellProps}>
            <SurtricsHeader{...toggleProps}/>
            <SurtricsNavbar/>
            <AppShell.Main>
                <ScrollArea>
                    {children}
                    <Space h={"xl"}/>
                    <Space h={"xl"}/>
                </ScrollArea>
            </AppShell.Main>
            <AppShell.Footer p="md">
                <Text ta={"center"} fz={"xs"}>
                    Surtrics 2023. Proud to be employee owned.<br/>
                    To suggest improvements, features, pages, or report bugs, please use the <a href={"https://surprice.productlift.dev/"}>SurSuite Product Lift page</a>
                </Text>
            </AppShell.Footer>
        </AppShell>)
}