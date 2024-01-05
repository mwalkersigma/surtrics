import {useEffect, useRef} from "react";
import {useDisclosure} from '@mantine/hooks';
import {
    AppShell, Text, ScrollArea, Space,
} from '@mantine/core';
import useNav from "../modules/hooks/useNav";
import SurtricsNavbar from "../components/mantine/layout/navbar";
import SurtricsHeader from "../components/mantine/layout/header";
import {SiBigcommerce, SiQuickbooks} from "react-icons/si";
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
    IconChartHistogram,
    IconTable,
    IconSettings,
    IconDeviceDesktopAnalytics, IconTimeline, IconExclamationCircle
} from "@tabler/icons-react";
import {FaEbay} from "react-icons/fa6";

const size= "1.5rem";
const stroke = 2;

const pages = {
    "Metrics": {
        "Dashboard": {
            href: "/",
            leftSection: <IconGauge size={size} stroke={stroke}/>
        },
        "Notable Events": {
            leftSection: <IconTimeline size={size} stroke={stroke}/>,
            href: "/timelines/listingNotableEvents"
        },
        "Increments": {
            leftSection: <IconCirclePlus size={size} stroke={stroke}/>,
            links: {
                "Graphs": {
                    leftSection: <IconChartHistogram size={size} stroke={stroke}/>,
                    opened:true,
                    links: {
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
            leftSection: <IconCheck size={size} stroke={stroke}/>,
            links: {
                "Graphs": {
                    leftSection: <IconChartHistogram size={size} stroke={stroke}/>,
                    links: {
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
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    links: {
                        "Weekly View": {
                            href: "/tables/approvals/weeklyView"
                        }
                    }
                }
            }
        },
        "Quantity": {
            leftSection: <IconTallymarks size={size} stroke={stroke}/>,
            links: {
                "Graphs": {
                    leftSection: <IconChartHistogram size={size} stroke={stroke}/>,
                    links: {
                        "Weekly View": {
                            href: "/graphs/quantity/weeklyView"
                        }
                    }
                },
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    links: {
                        "Weekly View": {
                            href: "/tables/quantity/weeklyView"
                        }
                    }
                }
            }
        },
        "Individual": {
            leftSection: <IconUser size={size} stroke={stroke}/>,
            links: {
                "Graphs": {
                    leftSection: <IconChartHistogram size={size} stroke={stroke}/>,
                    links: {
                        "Daily View": {
                            href: "/graphs/individual/individualGraph"
                        }
                    }
                },
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    links: {
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
        "Errors":{
            leftSection: <IconExclamationCircle size={size} stroke={stroke}/>,
            links:{
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    opened:true,
                    links: {
                        "My Errors": {
                            href: "/tables/errors/myErrors"
                        },
                        "Errors by User": {
                            roles: ["surplus director"],
                            href: "/tables/errors/errorsByUser"
                        },
                    }
                }
            }
        },
        "Warehouse": {
            leftSection: <IconForklift size={size} stroke={stroke}/>,
            links: {
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    opened:true,
                    links: {
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
            leftSection: <IconForms size={size} stroke={stroke}/>,
            roles: ["bsa", "surplus director","warehouse"],
            links: {
                "Submit Error": {
                    href: "/admin/errorReporting"
                },
                "Submit Event": {
                    leftSection: <IconActivity size={size} stroke={stroke}/>,
                    href: "/BSA/eventReporting"
                },
            }
        },
        "My Entries": {
            leftSection: <IconEdit size={size} stroke={stroke}/>,
            roles: ["bsa", "surplus director","warehouse"],
            links: {
                "Error Entries": {
                    href: "/viewers/error"
                },
            }
        }
    },
    "E-Commerce": {
        "E-Commerce Dashboard": {
            href: "/viewers/ecommerce",
            leftSection: <IconActivity size={size} stroke={stroke}/>
        },
        "Notable Events": {
            leftSection: <IconTimeline size={size} stroke={stroke}/>,
            href: "/timelines/surplusEcommerce"
        },
        "Sales": {
            leftSection: <IconReportMoney size={size} stroke={stroke}/>,
            links: {
                "Sales By Condition": {
                    leftSection: <IconReportMoney size={size} stroke={stroke}/>,
                    href: "/graphs/sales/salesByCondition"
                },
                "Graphs": {
                    leftSection: <IconChartHistogram size={size} stroke={stroke}/>,
                    links: {
                        "Weekly View": {
                            href: "/graphs/sales/weeklyView"
                        },
                        "Monthly View": {
                            href: "/graphs/sales/monthlyView"
                        },
                        "Yearly View": {
                            href: "/graphs/sales/yearlyView"
                        },
                        "Sales Over Spending": {
                            href: "/graphs/sales/salesOverSpending"
                        },
                    }
                },
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    links: {
                        "Range View": {
                            href: "/tables/sales/dailyView"
                        }
                    }
                }
            }
        },
        "ECommerce": {
            leftSection: <IconDeviceDesktopAnalytics size={size} stroke={stroke}/>,
            links: {
                "Big Commerce": {
                    leftSection: <SiBigcommerce size={'1.5rem'} stroke={stroke/2}/>,
                    href: "/graphs/bigCommerce/rangeView"
                },
                "Ebay": {
                    leftSection: <FaEbay size={'1.5rem'} stroke={stroke}/>,
                    href: "/graphs/ebay/rangeView"
                },
                "Quick Books": {
                    leftSection: <SiQuickbooks size={'1.5rem'} stroke={stroke}/>,
                    href: "/timelines/quickbooks"
                },
                "Pricing" : {
                    leftSection: <IconTallymarks size={size} stroke={stroke}/>,
                    href: "/graphs/pricingData/rangeView"
                }
            }
        },
        "Data Entry": {
            leftSection: <IconForms size={size} stroke={stroke}/>,
            roles: ["bsa", "surplus director"],
            links: {
                "Big Commerce": {
                    leftSection: <SiBigcommerce size={'1.5rem'} stroke={stroke/2}/>,
                    href: "/BSA/BigCommerceEntry",
                    roles: ["bsa"]
                },
                "Ebay": {
                    leftSection: <FaEbay size={'1.5rem'} stroke={stroke}/>,
                    href: "/BSA/EbayEntry",
                    roles: ["bsa"]
                },
                "Quick Book": {
                    leftSection: <SiQuickbooks size={'1.5rem'} stroke={stroke}/>,
                    href: "/BSA/quickBooks",
                    roles: ["surplus director"]
                },
                "Submit Event": {
                    leftSection: <IconActivity size={size} stroke={stroke}/>,
                    href: "/BSA/eventReporting"
                },
                "Pricing Backlog" : {
                    leftSection: <IconTallymarks size={size} stroke={stroke}/>,
                    href: "/BSA/pricingBacklogEntry"
                }
            }
        },
        "My Entries": {
            leftSection: <IconEdit size={size} stroke={stroke}/>,
            roles: ["bsa", "surplus director"],
            links: {
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
                },
                "Pricing Backlog" : {
                    href: "/viewers/pricingBacklog"
                }
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
            <SurtricsNavbar links={pages} footer={{
                "Admin": {
                        "Admin Dashboard": {
                            href: "/admin",
                            leftSection: <IconTable size={size} stroke={stroke}/>,
                        },
                        "Department Settings": {
                            href: "/admin/departmentSettings",
                            leftSection: <IconSettings size={size} stroke={stroke}/>,
                        },
                        "User Panel": {
                            leftSection: <IconUser size={size} stroke={stroke}/>,
                            href: "/admin/user",
                            roles: []
                        },
                        "Error type Settings": {
                            leftSection: <IconSettings size={size} stroke={stroke}/>,
                            href: "/admin/ErrorPanel",
                            roles: ["surplus director"]
                        },
                        "User Usage": {
                            leftSection: <IconUser size={size} stroke={stroke}/>,
                            href: "/admin/userUsage",
                            roles: []
                        },
                    }
                }} />
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