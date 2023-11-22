import {AppShell, NavLink, ScrollArea} from "@mantine/core";
import RoleWrapper from "../../RoleWrapper";

export default function SurtricsNavbar ({}) {
    return (
        <AppShell.Navbar p="md">
            <ScrollArea>
                <NavLink label={"Dashboard"} href={"/"}/>
                <NavLink label={"Increments"}>
                    <NavLink label={"Graphs"}>
                        <NavLink href="/graphs/increments/dailyView" label={"Daily View"}/>
                        <NavLink href="/graphs/increments/weeklyView" label={"Weekly View"}/>
                        <NavLink href="/graphs/increments/monthlyView" label={"Monthly View"}/>
                        <NavLink href="/graphs/increments/yearlyView" label={"Yearly View"}/>
                    </NavLink>
                </NavLink>
                <NavLink label={"Approvals"}>
                    <NavLink label={"Graphs"}>
                        <NavLink href="/graphs/approvals/weekView" label={"Weekly View"}/>
                        <NavLink href="/graphs/approvals/monthlyView" label={"Monthly View"}/>
                        <NavLink href="/graphs/approvals/yearView" label={"Yearly View"}/>
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
                            <NavLink label={"Quick Book"} href={"/BSA/quickBooks"}/>
                            <NavLink label={"Submit Error Type"} href={"/BSA/createErrorType"}/>
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
                        <RoleWrapper invisible altRoles={["surplus director"]}>
                            <NavLink label={"Error type Viewer"} href={"/admin/ErrorPanel"}/>
                        </RoleWrapper>
                    </NavLink>
                </RoleWrapper>
                <RoleWrapper invisible altRoles={["surplus director"]}>
                    <NavLink label={"Admin"}>
                        <NavLink label={"Admin Settings"} href={"/admin"}/>
                        <NavLink label={"Update Goals"} href={"/admin/updateGoal"}/>
                        <RoleWrapper invisible>
                            <NavLink label={"User Panel"} href={"/admin/user"}/>
                        </RoleWrapper>
                    </NavLink>
                </RoleWrapper>
            </ScrollArea>
        </AppShell.Navbar>
    )
}