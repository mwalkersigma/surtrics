import cx from 'clsx';
import {useEffect, useRef, useState} from "react";
import classes from '../styles/HeaderTabs.module.css';
import {useDisclosure} from '@mantine/hooks';
import {
    AppShell,
    Burger,
    Group,
    rem,
    Text,
    Menu,
    UnstyledButton,
    Avatar,
    useMantineTheme,
    useMantineColorScheme,
    NavLink,
} from '@mantine/core';
import {
    IconChevronDown,
    IconLogout,
    IconSwitchHorizontal,
} from "@tabler/icons-react";
import {signIn, signOut, useSession} from "next-auth/react";
import Button from "react-bootstrap/Button";
import RoleWrapper from "../components/RoleWrapper";
import useNav from "../modules/hooks/useNav";


export default function Layout({children}) {
    const hasNavBar = useNav();
    const intervalRef = useRef();
    const {setColorScheme, colorScheme} = useMantineColorScheme()
    const [mobileOpened, {toggle: toggleMobile}] = useDisclosure();
    const [desktopOpened, {toggle: toggleDesktop}] = useDisclosure(true);

    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const {data: session} = useSession();
    const user = session?.user;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        let twentyFourHours = 1000 * 60 * 60 * 24;
        intervalRef.current = setInterval(() => {
            window.location.reload();
        }, twentyFourHours);
        return () => clearInterval(intervalRef.current);
    }, []);

    if (!hasNavBar) return children;
    return (
        <AppShell header={{height: 60}} padding="md"
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: {
                    mobile: !mobileOpened,
                    desktop: !desktopOpened
                },
            }}
        >
            <AppShell.Header>
                <Group h="100%" justify="space-between">
                    <Group h="100%" px="md">
                        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm"/>
                        <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm"/>
                        <Text href={"/"} size="xl">Surtrics</Text>
                    </Group>
                    <Group h="100%">
                    {!user && (
                        <Button onClick={() => signIn("google")} variant="default">
                            Sign In
                        </Button>
                    )}
                    {user && (
                        <Menu
                            style={{justifySelf: "flex-end"}}
                            width={260}
                            position="bottom-end"
                            transitionProps={{transition: 'pop-top-right'}}
                            onClose={() => setUserMenuOpened(false)}
                            onOpen={() => setUserMenuOpened(true)}
                            withinPortal
                        >
                            <Menu.Target>
                                <UnstyledButton
                                    className={cx(classes.user, {[classes.userActive]: userMenuOpened})}
                                >
                                    <Group gap={7}>
                                        <Avatar src={user.image} alt={user.name} radius="xl" size={20}/>
                                        <Text fw={500} size="sm" lh={1} mr={3}>
                                            {user.name}
                                        </Text>
                                        <IconChevronDown style={{width: rem(12), height: rem(12)}} stroke={1.5}/>
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Settings</Menu.Label>
                                <Menu.Item
                                    onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}>
                                    <Group gap={7}>
                                        <IconSwitchHorizontal style={{width: rem(16), height: rem(16)}}
                                                              stroke={1.5}/>
                                        <Text>Toggle theme</Text>
                                    </Group>
                                </Menu.Item>

                                <Menu.Item
                                    onClick={() => signOut()}
                                    leftSection={
                                        <IconLogout style={{width: rem(16), height: rem(16)}} stroke={1.5}/>
                                    }
                                >
                                    Logout
                                </Menu.Item>
                                {/*<Menu.Divider />*/}
                            </Menu.Dropdown>
                        </Menu>
                    )}

                </Group>
            </Group>

        </AppShell.Header>
        <AppShell.Navbar p="md">
            <NavLink label={"Dashboard"} href={"/"}/>
            <NavLink label={"Increments"}>
                <NavLink label={"Graphs"}>
                    <NavLink href={"/graphs/increments/dailyView"} label={"Daily View"}/>
                    <NavLink href="/graphs/increments/yearlyView" label={"Yearly View"}/>
                    <NavLink href="/graphs/increments/monthlyView" label={"Monthly View"}/>
                    <NavLink href="/graphs/increments/weeklyView" label={"Weekly View"}/>
                    <NavLink href="/graphs/increments/dailyView" label={"Daily View"}/>
                </NavLink>
            </NavLink>
            <NavLink label={"Approvals"}>
                <NavLink label={"Graphs"}>
                    <NavLink href="/graphs/approvals/yearView" label={"Yearly View"}/>
                    <NavLink href="/graphs/approvals/monthlyView" label={"Monthly View"}/>
                    <NavLink href="/graphs/approvals/weekView" label={"Weekly View"}/>
                </NavLink>
                <NavLink label={"Tables"}>
                    <NavLink href="/tables/approvalsView" label={"Weekly View"}/>
                </NavLink>
            </NavLink>
            <NavLink label={"Quantity"}>
                <NavLink label={"Graphs"}>
                    <NavLink href="/graphs/quantity/weeklyView" label={"Weekly View"}/>
                </NavLink>
                <NavLink label={"Tables"}>
                    <NavLink href="/tables/quantityView" label={"Weekly View"}/>
                </NavLink>
            </NavLink>
            <NavLink label={"Sales"}>
                <NavLink label={"Tables"}>
                    <NavLink href="/tables/salesView" label={"Daily View"}/>
                </NavLink>
            </NavLink>
            <NavLink label={"Individual"}>
                <NavLink label={"Graphs"}>
                    <NavLink href="/graphs/individual/individualGraph" label={"Daily View"}/>
                </NavLink>
                <NavLink label={"Tables"}>
                    <NavLink href="/tables/individualView" label={"Daily View"}/>
                </NavLink>
            </NavLink>
            <NavLink label={"Warehouse"}>
                <NavLink label={"Tables"}>
                    <NavLink href="/tables/warehousePicks" label={"Weekly View"}/>
                </NavLink>
            </NavLink>
            <RoleWrapper invisible altRoles={["bsa", "surplus director"]}>
                <NavLink label={"Data Entry"}>
                    <RoleWrapper invisible altRoles={["bsa"]}>
                        <NavLink label={"Big Commerce"} href={"/BSA/BigCommerceEntry"}/>
                        <NavLink label={"Ebay"} href={"/BSA/EbayEntry"}/>
                    </RoleWrapper>
                    <RoleWrapper invisible altRoles={["surplus director"]}>
                        <NavLink label={"Surplus"} href={"/surplusEntry"}/>
                    </RoleWrapper>
                    <NavLink label={"Submit Event"} href={"/BSA/eventReporting"}/>
                    <NavLink label={"Submit Error"} href={"/admin/errorReporting"}/>
                </NavLink>
            </RoleWrapper>
            <RoleWrapper invisible altRoles={["bsa", "surplus director"]}>
                <NavLink label={"Viewers"}>
                    <NavLink label={"Error Viewer"} href={"/viewers/error"}/>
                    <NavLink label={"Event Viewer"} href={"/viewers/event"}/>
                    <NavLink label={"Ebay Viewer"} href={"/viewers/ebay"}/>
                    <NavLink label={"Big Commerce Viewer"} href={"/viewers/bigCommerce"}/>
                    <NavLink label={"Quick Books Viewer"} href={"/viewers/quickBooks"}/>
                    <NavLink label={"E-Commerce Viewer"} href={"/viewers/ecommerce"}/>
                </NavLink>
            </RoleWrapper>
            <RoleWrapper invisible altRoles={["surplus director"]}>
                <NavLink label={"Admin"}>
                    <NavLink label={"Admin Settings"} href={"/admin"}/>
                    <NavLink label={"Update Goals"} href={"/admin/updateGoal"}/>
                </NavLink>
            </RoleWrapper>
        </AppShell.Navbar>
        <AppShell.Main>
            {children}
        </AppShell.Main>
        <AppShell.Footer p="md">
            <Text fz={"xs"}>
                Surtrics 2023 Built By Michael Walker.
                Proud to be employee owned.
            </Text>
        </AppShell.Footer>
    </AppShell>)
}