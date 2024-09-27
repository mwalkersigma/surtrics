import {useEffect, useRef} from "react";
import {useDisclosure} from '@mantine/hooks';
import {AppShell, ScrollArea, Space, Text,} from '@mantine/core';
import useNav from "../modules/hooks/useNav";
import SurtricsNavbar from "../components/mantine/layout/navbar";
import SurtricsHeader from "../components/mantine/layout/header";
import {SiBigcommerce, SiQuickbooks} from "react-icons/si";
import {
    IconActivity,
    IconCamera,
    IconChartHistogram,
    IconCheck,
    IconChecklist,
    IconCirclePlus,
    IconClipboardData,
    IconConfetti,
    IconDeviceDesktopAnalytics,
    IconEdit,
    IconExclamationCircle,
    IconFileAnalytics,
    IconFocus,
    IconForklift,
    IconForms,
    IconGauge,
    IconGaugeFilled,
    IconGitCompare,
    IconHealthRecognition,
    IconReportMoney,
    IconSettings,
    IconTable,
    IconTallymarks,
    IconTimeline,
    IconUser
} from "@tabler/icons-react";
import {FaEbay} from "react-icons/fa6";

const size = "1.5rem";
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
        "Celebration": {
            leftSection: <IconConfetti size={size} stroke={stroke}/>,
            href: "/celebration",
            roles: ["loggedIn"]
        },
        "Increments": {
            leftSection: <IconCirclePlus size={size} stroke={stroke}/>,
            links: {
                "Graphs": {
                    leftSection: <IconChartHistogram size={size} stroke={stroke}/>,
                    opened: true,
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
                        "Range View": {
                            href: "/graphs/approvals/rangeView"
                        }
                    }
                },
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    links: {
                        "Range View": {
                            href: "/tables/approvals/rangeView"
                        },
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
                        "Range View": {
                            href: "/graphs/quantity/rangeView"
                        }
                    }
                },
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    links: {
                        "Range View": {
                            href: "/tables/quantity/rangeView"
                        }
                    }
                }
            }
        },
        "Drive Parser": {
            leftSection: <IconFileAnalytics size={size} stroke={stroke}/>,
            links: {
                "Review": {
                    href: "/admin/driveParser/review",
                    leftSection: <IconChecklist size={size} stroke={stroke}/>,
                    roles: ["surplus director", "bsa"]
                },
                "Stats": {
                    href: "/admin/driveParser/stats",
                    leftSection: <IconHealthRecognition size={size} stroke={stroke}/>,
                    roles: [
                        "admin"
                        // "surplus director",
                        // "bsa"
                    ]
                }
            },
            roles: ["surplus director", "bsa"]
        },
        "Quality Audits": {
            leftSection: <IconFileAnalytics size={size} stroke={stroke}/>,
            roles: ["bsa", "surplus director", "warehouse"],
            links: {
                "Audit Entry": {
                    href: "/BSA/QualityAudits",
                },
                "Audit Viewer": {
                    href: "/tables/audits",
                },
                "Audits By Auditor": {
                    href: "/tables/audits/byAuditor",
                },

            }
        },
        "Skill Assessment":{
            leftSection: <IconGauge size={size} stroke={stroke}/>,
            links:{
                "Enter Assessment" : {
                    href: "/admin/skillAssessment",
                    leftSection: <IconGaugeFilled size={size} stroke={stroke}/>,
                    roles: ["surplus director", "bsa", "warehouse"]
                },
                "Entry Viewer" : {
                    href: "/viewers/skillAssessment",
                    leftSection: <IconGauge size={size} stroke={stroke}/>,
                    roles: ["surplus director", "bsa", "warehouse"]
                },
                "Assessment Viewer":{
                    href: "/tables/skillAssessment",
                    leftSection: <IconGauge size={size} stroke={stroke}/>,
                }
            }
        },
        "Individual": {
            leftSection: <IconUser size={size} stroke={stroke}/>,
            links: {
                "Skill Assessment": {
                    href: "/admin/skillAssessment",
                    leftSection: <IconGauge size={size} stroke={stroke}/>,
                    roles: ["surplus director", "bsa", "warehouse"]
                },
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
        "Photos": {
            leftSection: <IconCamera size={size} stroke={stroke}/>,
            links: {
                "Graphs": {
                    leftSection: <IconChartHistogram size={size} stroke={stroke}/>,
                    opened: true,
                    links: {
                        "Range View": {
                            href: "/graphs/photos/rangeViewer"
                        }
                    }
                },
            }
        },
        "Errors": {
            leftSection: <IconExclamationCircle size={size} stroke={stroke}/>,
            links: {
                "Submit Error": {
                    href: "/admin/errorReporting",
                    roles: ["bsa", "surplus director", "warehouse"]
                },
                "Error Entries": {
                    href: "/viewers/error",
                    roles: ["bsa", "surplus director", "warehouse"]
                },
                "Error Type Creator": {
                    href: "/BSA/createErrorType",
                    roles: ["surplus director"]
                },
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    opened: true,
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
                    opened: true,
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
        "Surprice": {
            leftSection: <IconTallymarks size={size} stroke={stroke}/>,
            roles: ["buying group", "surplus director"],
            links: {
                "Research Entries": {
                    href: "/graphs/surprice/researchEntries"
                },
            }
        },
        "Data Entry": {
            leftSection: <IconForms size={size} stroke={stroke}/>,
            roles: ["bsa", "surplus director", "warehouse"],
            links: {
                "Submit Event": {
                    leftSection: <IconActivity size={size} stroke={stroke}/>,
                    href: "/BSA/eventReporting"
                },
            }
        },
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
                        "orders": {
                            href: "/graphs/sales/orders"
                        }
                    }
                },
                "Tables": {
                    leftSection: <IconTable size={size} stroke={stroke}/>,
                    links: {
                        "Fast Sales": {
                            href: "/tables/sales/fastSales"
                        },
                        "Range View": {
                            href: "/tables/sales/dailyView"
                        },
                        "Sales By Price Range": {
                            href: "/tables/sales/salesByPriceRange"
                        },
                    }
                }
            }
        },
        "Simplified": {
            leftSection: <IconFocus size={size} stroke={stroke}/>,
            links: {
                "Sales Over Spending": {
                    href: "/graphs/sales/salesOverSpending/simplified",
                    leftSection: <IconReportMoney size={size} stroke={stroke}/>
                },
                "Sales Compounding ": {
                    href: "/graphs/sales/yearlyView/simplified",
                    leftSection: <IconReportMoney size={size} stroke={stroke}/>
                },
                "Increments Compounding" : {
                    href: "/graphs/increments/yearlyView/simplified",
                    leftSection: <IconCirclePlus size={size} stroke={stroke}/>
                },
                "orders": {
                    href: "/graphs/sales/orders/simplified",
                    leftSection: <IconReportMoney size={size} stroke={stroke}/>
                }
            }
        },
        "ECommerce": {
            leftSection: <IconDeviceDesktopAnalytics size={size} stroke={stroke}/>,
            links: {
                "Big Commerce": {
                    leftSection: <SiBigcommerce size={'1.5rem'} stroke={stroke / 2}/>,
                    href: "/graphs/bigCommerce/rangeView"
                },
                "Ebay": {
                    leftSection: <FaEbay size={'1.5rem'} stroke={stroke}/>,
                    href: "/graphs/ebay/rangeView"
                },
                "Ebay Defect Rate": {
                    leftSection: <FaEbay size={'1.5rem'} stroke={stroke}/>,
                    href: "/graphs/ebay/defectRate"
                },
                "Quick Books": {
                    leftSection: <SiQuickbooks size={'1.5rem'} stroke={stroke}/>,
                    href: "/timelines/quickbooks"
                },
                "Pricing": {
                    leftSection: <IconClipboardData size={size} stroke={stroke}/>,
                    href: "/graphs/pricingData/rangeView"
                },
                "Pricing Backlog": {
                    leftSection: <IconReportMoney size={size} stroke={stroke}/>,
                    href: "/graphs/pricingData/pricingBacklogRangeView"
                },
                "Ecommerce Comparison": {
                    leftSection: <IconGitCompare size={size} stroke={stroke}/>,
                    href: "/tables/ecommerce/ecommerceComparison"

                }
            }
        },
        "Data Entry": {
            leftSection: <IconForms size={size} stroke={stroke}/>,
            roles: ["bsa", "surplus director"],
            links: {
                "Big Commerce": {
                    leftSection: <SiBigcommerce size={'1.5rem'} stroke={stroke / 2}/>,
                    href: "/BSA/BigCommerceEntry",
                    roles: ["bsa"]
                },
                "Ebay": {
                    leftSection: <FaEbay size={'1.5rem'} stroke={stroke}/>,
                    href: "/BSA/EbayEntry",
                    roles: ["bsa"]
                },
                "Ebay Defect Rate": {
                    leftSection: <FaEbay size={'1.5rem'} stroke={stroke}/>,
                    href: "/BSA/ebayDefectRate",
                    roles: ["bsa", "surplus director"]
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
                "Pricing Backlog": {
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
                "Ebay Defect Rate": {
                    href: "/viewers/ebayDefectRate",
                    roles: ["surplus director", "bsa"]
                },
                "Big Commerce": {
                    href: "/viewers/bigCommerce"
                },
                "Quick Books": {
                    href: "/viewers/quickBooks"
                },
                "Pricing Backlog": {
                    href: "/viewers/pricingBacklog"
                }
            }
        }
    },
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
        }}/>
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
                To suggest improvements, features, pages, or report bugs, please use the <a
                href={"https://surprice.productlift.dev/"}>SurSuite Product Lift page</a>
            </Text>
        </AppShell.Footer>
    </AppShell>)
}