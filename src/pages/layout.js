import {useEffect, useRef} from "react";
import {useDisclosure} from '@mantine/hooks';
import {
    AppShell, Text, ScrollArea, Space,
} from '@mantine/core';
import useNav from "../modules/hooks/useNav";
import SurtricsNavbar from "../components/mantine/layout/navbar";
import SurtricsHeader from "../components/mantine/layout/header";
import {IconActivity} from "@tabler/icons-react";


const pages = {
    "Dashboard": {
        href: "/",
        //leftSection:<IconActivity size="1rem" stroke={1.5} />
    },
    "E-Commerce Dashboard": {
        href: "/viewers/ecommerce",
        //leftSection:<IconActivity size="1rem" stroke={1.5} />
    },
    "Increments": {
        links:{
            "graphs": {
                links:{
                    "Daily View": {
                        href: "/graphs/increments/dailyView"
                    },
                    "Weekly View": {
                        href: "/graphs/increments/weeklyView"
                    },
                    "Monthly View": {
                        href: "/graphs/increments/monthlyView"
                    },
                    "Yearly View": {
                        href: "/graphs/increments/yearlyView"
                    }
                }
            }
        }
    },
    "Approvals": {
        links:{
            "graphs": {
                links:{
                    "Weekly View": {
                        href: "/graphs/approvals/weekView"
                    },
                    "Monthly View": {
                        href: "/graphs/approvals/monthlyView"
                    },
                    "Yearly View": {
                        href: "/graphs/approvals/yearView"
                    }
                }
            },
            "tables": {
                links:{
                    "Weekly View": {
                        href: "/tables/approvals/weeklyView"
                    }
                }
            }
        }
    },
    "Quantity": {
        links:{
            "graphs": {
                links:{
                    "Weekly View": {
                        href: "/graphs/quantity/weeklyView"
                    }
                }
            },
            "tables": {
                links:{
                    "Weekly View": {
                        href: "/tables/quantity/weeklyView"
                    }
                }
            }
        }
    },
    "Sales": {
        links:{
            "graphs": {
                links:{
                    "Weekly View": {
                        href: "/graphs/sales/weeklyView"
                    },
                    "Monthly View": {
                        href: "/graphs/sales/monthlyView"
                    },
                    "Yearly View": {
                        href: "/graphs/sales/yearlyView"
                    }
                }
            },
            "tables": {
                links:{
                    "Daily View": {
                        href: "/tables/sales/dailyView"
                    }
                }
            }
        }
    },
    "Individual": {
        links:{
            "graphs": {
                links:{
                    "Daily View": {
                        href: "/graphs/individual/individualGraph"
                    }
                }
            },
            "tables": {
                links:{
                    "Daily View": {
                        href: "/tables/individual/dailyView"
                    },
                    "Weekly View": {
                        href: "/tables/individual/weeklyView"
                    },
                    "Monthly View": {
                        href: "/tables/individual/monthlyView"
                    },
                    "Yearly View": {
                        href: "/tables/individual/yearlyView"
                    }
                }
            }
        }
    },
    "Warehouse": {
        links:{
            "tables": {
                links:{
                    "Weekly View": {
                        href: "/tables/warehouse/weeklyView"
                    },
                    "Monthly View": {
                        href: "/tables/warehouse/monthlyView"
                    },
                    "Yearly View": {
                        href: "/tables/warehouse/yearlyView"
                    }
                }
            }
        }
    },
    "Data Entry": {
        roles: ["bsa", "surplus director"],
        links:{
            "Big Commerce": {
                href: "/BSA/BigCommerceEntry",
                roles: ["bsa"]
            },
            "Ebay": {
                href: "/BSA/EbayEntry",
                roles: ["bsa"]
            },
            "Quick Book": {
                href: "/BSA/quickBooks",
                roles: ["surplus director"]
            },
            "Submit Error Type": {
                href: "/BSA/createErrorType",
                roles: ["surplus director"]
            },
            "Submit Event": {
                href: "/BSA/eventReporting"
            },
            "Submit Error": {
                href: "/admin/errorReporting"
            }
        }
    },
    "Viewers": {
        roles: ["bsa", "surplus director"],
        links:{
            "Error Viewer": {
                href: "/viewers/error"
            },
            "Event Viewer": {
                href: "/viewers/event"
            },
            "Ebay Viewer": {
                href: "/viewers/ebay"
            },
            "Big Commerce Viewer": {
                href: "/viewers/bigCommerce"
            },
            "Quick Books Viewer": {
                href: "/viewers/quickBooks"
            },
            "Error type Viewer": {
                href: "/admin/ErrorPanel",
                roles: ["surplus director"]
            }
        }
    },
    "Admin": {
        roles: ["surplus director"],
        links:{
            "Admin Settings": {
                href: "/admin"
            },
            "Update Goals": {
                href: "/admin/updateGoal"
            },
            "User Panel": {
                href: "/admin/user",
                roles: []
            }
        }
    }
}


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
            <SurtricsNavbar links={pages}/>
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