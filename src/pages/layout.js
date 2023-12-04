import {useEffect, useRef} from "react";
import {useDisclosure} from '@mantine/hooks';
import {
    AppShell, Text, ScrollArea, Space,
} from '@mantine/core';
import useNav from "../modules/hooks/useNav";
import SurtricsNavbar from "../components/mantine/layout/navbar";
import SurtricsHeader from "../components/mantine/layout/header";
import {
    IconActivity,
    IconCheck,
    IconCirclePlus,
    IconForklift,
    IconForms,
    IconGauge,
    IconReportMoney,
    IconTallymarks,
    IconUser,
    IconEdit,
    IconKey,
    IconChartHistogram,
    IconTable,
    IconSettings,
    IconTargetArrow,
    IconDeviceDesktopAnalytics
} from "@tabler/icons-react";

const size= "1.5rem";
const stroke = 2;

const pages = {
    "Dashboard": {
        href: "/",
        leftSection:<IconGauge size={size} stroke={stroke} />
    },
    "E-Commerce Dashboard": {
        href: "/viewers/ecommerce",
        leftSection:<IconActivity size={size} stroke={stroke} />
    },
    "Increments": {
        leftSection:<IconCirclePlus size={size} stroke={stroke} />,
        links:{
            "Graphs": {
                leftSection:<IconChartHistogram size={size} stroke={stroke} />,
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
        leftSection:<IconCheck size={size} stroke={stroke} />,
        links:{
            "Graphs": {
                leftSection:<IconChartHistogram size={size} stroke={stroke} />,
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
            "Tables": {
                leftSection:<IconTable size={size} stroke={stroke} />,
                links:{
                    "Weekly View": {
                        href: "/tables/approvals/weeklyView"
                    }
                }
            }
        }
    },
    "Quantity": {
        leftSection:<IconTallymarks size={size} stroke={stroke} />,
        links:{
            "Graphs": {
                leftSection:<IconChartHistogram size={size} stroke={stroke} />,
                links:{
                    "Weekly View": {
                        href: "/graphs/quantity/weeklyView"
                    }
                }
            },
            "Tables": {
                leftSection:<IconTable size={size} stroke={stroke} />,
                links:{
                    "Weekly View": {
                        href: "/tables/quantity/weeklyView"
                    }
                }
            }
        }
    },
    "Individual": {
        leftSection:<IconUser size={size} stroke={stroke} />,
        links:{
            "Graphs": {
                leftSection:<IconChartHistogram size={size} stroke={stroke} />,
                links:{
                    "Daily View": {
                        href: "/graphs/individual/individualGraph"
                    }
                }
            },
            "Tables": {
                leftSection:<IconTable size={size} stroke={stroke} />,
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
        leftSection:<IconForklift size={size} stroke={stroke} />,
        links:{
            "Tables": {
                leftSection:<IconTable size={size} stroke={stroke} />,
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
    "ECommerce": {
        roles: ["bsa", "surplus director"],
        leftSection:<IconDeviceDesktopAnalytics size={size} stroke={stroke} />,
        links:{}
    },
    "Sales": {
        leftSection:<IconReportMoney size={size} stroke={stroke} />,
        links:{
            "Graphs": {
                leftSection:<IconChartHistogram size={size} stroke={stroke} />,
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
            "Tables": {
                leftSection:<IconTable size={size} stroke={stroke} />,
                links:{
                    "Daily View": {
                        href: "/tables/sales/dailyView"
                    }
                }
            }
        }
    },
    "Data Entry": {
        leftSection:<IconForms size={size} stroke={stroke} />,
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
    "My Entries": {
        leftSection:<IconEdit size={size} stroke={stroke} />,
        roles: ["bsa", "surplus director"],
        links:{
            "Error Entries": {
                href: "/viewers/error"
            },
            "Event Entries": {
                href: "/viewers/event"
            },
            "Ebay": {
                href: "/viewers/ebay"
            },
            "Big Commerce": {
                href: "/viewers/bigCommerce"
            },
            "Quick Books": {
                href: "/viewers/quickBooks"
            }
        }
    },
    "Admin": {
        leftSection:<IconKey size={size} stroke={stroke} />,
        roles: ["surplus director"],
        links:{
            "Admin Settings": {
                href: "/admin",
                leftSection:<IconSettings size={size} stroke={stroke} />,
            },
            "Update Goals": {
                href: "/admin/updateGoal",
                leftSection:<IconTargetArrow size={size} stroke={stroke} />,
            },
            "User Panel": {
                leftSection:<IconUser size={size} stroke={stroke} />,
                href: "/admin/user",
                roles: []
            },
            "Error type Settings": {
                leftSection:<IconSettings size={size} stroke={stroke} />,
                href: "/admin/ErrorPanel",
                roles: ["surplus director"]
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