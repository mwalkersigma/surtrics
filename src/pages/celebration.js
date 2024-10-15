import React, {useState} from 'react';
import {
    Badge,
    ColorSwatch,
    Container,
    Flex,
    Grid,
    Group,
    NumberFormatter,
    rem,
    SimpleGrid,
    Space,
    Switch,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import {IconClock, IconConfetti, IconConfettiOff, IconCurrencyDollar} from "@tabler/icons-react";
import formatter from "../modules/utils/numberFormatter";
import Confetti from "../components/confetti";
import {eachWeekOfInterval} from "date-fns";
import useUsage from "../modules/hooks/useUsage";
import {useLocalStorage, useSetState} from "@mantine/hooks";
import Metric, {DirectRenderMetric} from "../modules/classes/metric";
import {useQuery} from "@tanstack/react-query";
import useUpdates from "../modules/hooks/useUpdates";
import SwatchMenu from "../components/swatchMenu";
import CelebrationCard from "../components/celebrationCard";

const defaultBillableHour = 33;

function trunc(value) {
    if (!value) return null;
    return Math.trunc(value * 100) / 100
}

const pallette = {
    "Surplus": "#660606",
    "Shop": "#09287a",
    "Equipment": "#366f08",
    "Procurement": "#cd4920",
}
const metrics = [
    new Metric({
        title: "Surprice Pricing Sheet Auto Complete",
        Explanation: `
            This metric is calculated by estimating that 
            it takes approximately 3 minutes to research each model number in a pricing sheet. 
            Consecutive runs of the sheet are not counted as time saved since the data must 
            be researched for the sheet each time. Each model number is counted only once.
        `,
        system: "Surprice",
        systemBadgeName: "Surprice",
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula(value) {
                this.raw = (value * 3 / 60)
            }
        },
        value: {
            raw: null,
            unit: "Rows found first run",
            collectionDateStart: "07/01/2023",
            formula(value) {
                this.raw = formatter(value)
            }
        }, values: [
            "updateSheet.FoundFirstRun"
        ]
    }),
    new Metric({
        title: "Surplus listing Duplicate Checker",
        Explanation: `
            This metric uses the results of a time study preformed by Libby 
            that concluded it takes roughly 12.149 seconds to research each 
            model number in a surplus listing.
            
            The time saved is calculated by multiplying the number of
            model numbers found by 12.149 seconds and converting the result to hours.
        `,
        systemBadgeName: "Surprice",
        system: "Surprice",
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula(value) {
                this.raw = ((value + 16430 * 12.149) / 3600)
            }
        },
        value: {
            raw: null, unit: "Model numbers checked", collectionDateStart: "12/13/2023", formula(value) {
                this.raw = formatter(value + 16430)
            }
        },
        values: [
            "API.findDuplicate", "API.find duplicates"
        ]
    }),
    new Metric({
        title: "Surplus Metrics Tracking",
        Explanation: `
            When manually tracking surplus metrics, it takes on average 10 minutes ( between 5 and 15 ) to
            update the surplus metrics tracking sheet. This metric calculates the time
            saved by multiplying the number of weeks since surtrics was implemented by
            times 5 work days, time 3 updates per day, and then converting the result to hours.
        `,
        system: "Surtrics",
        systemBadgeName: "Surtrics",
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula() {
                let startDate = new Date('09/04/2023')
                let weeks = eachWeekOfInterval({
                    start: startDate, end: new Date()
                })
                this.raw = (weeks.length * 5 * 3 * 10 / 60)
            }
        },
        value: {
            raw: null,
            unit: "Weeks active",
            collectionDateStart: "09/04/2023",
            formula() {
                let startDate = new Date('09/04/2023')
                let weeks = eachWeekOfInterval({start: startDate, end: new Date()})
                this.raw = formatter(weeks.length)
            }
        },
    }),
    new Metric({
        title: "Channel Advisor Auto Pricing ",
        Explanation: `
            This metric increments each time a price is sent to channel advisor by the drive parser.
            This process takes around 6 hours to complete 100 parents Skus ( 400 child skus ).
            This works out to 3.5 minutes per parent sku.
            
            The time saved is calculated by multiplying the number of prices divided by 4 times 3.5 minutes each and converting the result to hours.
        `,
        systemBadgeName: "Drive Parser",
        system: "Drive Parser",
        timeSavings: {
            raw: null, unit: "Hrs saved", formula(value) {
                this.raw = (((value / 4) * 3.5) / 60)
            }
        }, value: {
            raw: null, unit: "Prices Sent", collectionDateStart: "12/13/2023", formula(value) {
                this.raw = formatter(value)
            }
        }, values: [
            "API.priceUpdated",
        ]
    }),
];

const poLineItemsMetric = new DirectRenderMetric({
    title: "Po Line Item Creation",
    Explanation: `
            Based on a time study conducted by Libby, it takes on average 63 seconds to add an item into inventory from 
            from manual PO creation. so we take the number of items added and multiply by 63 seconds and convert to hours.
        `,
    systemBadgeName: "Drive Parser",
    system: "Drive Parser",
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(value) {
            this.raw = (((value) * 63) / 60 / 60)
        }
    },
    value: {
        raw: null, unit: "Lines generated on POs", collectionDateStart: "05/31/2024", formula(value) {
            this.raw = formatter(value)
        }
    },
})
const poCreationCountMetric = new DirectRenderMetric({
    title: "PO Creation",
    Explanation: `
            Each Po that is created with the Drive Parser is a huge victory.
            It allows : 
                Costs to be assigned to each PO line item so in the future every item in Sku Vault has a cost.
                Pricing to be sent to Channel Advisor for every item on the PO.
                No one in BSA has to manually create a cost sheet and submit manual costs at the sku level.
                This can sometimes take up to 8 hours to complete.
    `,
    systemBadgeName: "Drive Parser",
    system: "Drive Parser",
    timeSavings: {
        raw: null,
        unit: "hrs Saved",
        formula(value) {

            this.raw = (value * 65) / 60
        }
    },
    value: {
        raw: null,
        unit: "POs generated",
        collectionDateStart: "05/31/2024",
        formula(value) {
            this.raw = value
        }
    },

})
const photoUploadMetric = new DirectRenderMetric({
    title: "Photos Uploaded",
    Explanation: `
        This metric is calculated by counting the number of image_last_updated_by tags in channel advisor. 
        The various photo scripts update this number and then we can then use the average number of photos ( 3 )
        to get the number of photos uploaded. This is an estimate not an exact number.
        
        The time savings are calculated by taking the number of photo credits and multiplying by 45 seconds and converting to hours.
       
    `,
    systemBadgeName: "Photo Script",
    system: "Photo Script",
    timeSavings: {
        raw: null,
        unit: "hrs Saved",
        formula(value) {
            this.raw = trunc((value * 45) / 60 / 60)
        }
    },
    value: {
        raw: null,
        unit: "photos uploaded",
        collectionDateStart: "12/08/2023",
        formula(value) {
            this.raw = formatter(value)
        }
    },

})
let shopSavings = new DirectRenderMetric({
    title: "Shop Orders Sent To Insightly",
    Explanation: `
        When an order is placed on the surplus website by the SHOP it is automatically sent to Insightly. 
        This metric counts the number of orders sent to Insightly.
        Each order After being placed took around 15 minutes in the past to be manually entered into Insightly.
        `,
    systemBadgeName: "SOIC",
    system: "Shop Order Insightly Connector",
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = (val * 15 / 60)
        }
    },
    value: {
        raw: null,
        unit: "Orders sent",
        collectionDateStart: "02/19/2024",
        formula(val) {
            this.raw = formatter(val)
        }
    },
});
const quoteBuilderMetrics = new DirectRenderMetric({
    title: "Quote Builder Automation",
    Explanation: `
        The quote builder generates quotes based on insightly opportunities.
        This allows us to quickly generate quotes that follow a consistent format.
    `,
    systemBadgeName: "Quote Builder",
    system: "Quote Builder",
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = (val * 120 / 60 / 60)
        }
    },
    value: {
        raw: null,
        unit: "Quotes generated",
        collectionDateStart: "08/12/2024",
        formula(val) {
            this.raw = formatter(val)
        }
    }
});
const importerMetric = new DirectRenderMetric({
    title: "Importer Template Approvals",
    Explanation: `
        The importer takes data entered by surplus listers. It then process that data to include all the needed data
        for Sku Vault and Channel Advisor. It then uploads them to both platforms. This process was previously manual and 
        was calculated to take around 2 minutes per sku to preform. 
    `,
    systemBadgeName: "Importer",
    system: "Importer",
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = trunc(val * 2 / 60)
        }
    },
    value: {
        raw: null,
        unit: "Templates approved",
        collectionDateStart: "12/12/2022",
        formula(val) {
            this.raw = formatter(val)
        }
    }
});
const pricingSheetFoldersCreated = new DirectRenderMetric({
    title: "Pricing Sheet Folders Created",
    Explanation: `
        Pricing Folders are generated when an insightly Parts opportunity is moved to stage 3.
        When preformed manually this process takes 1 min 56.33 secs on average to complete. 
        This includes finding the document sequence number, finding the insightly opp id, creating a folder
        with a properly formatted title and cloning the pricing sheet template and creating a photos folder.
        and putting all of that into the procurements folder so that it can be processed by the drive parser. 
        and adding a link to the folder in insightly.
    `,
    system: "Price Sheet Maker",
    systemBadgeName: "Sheet Maker",
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = trunc(val * 116 / 60 / 60)
        }
    },
    value: {
        raw: null,
        unit: "Folders created",
        collectionDateStart: "02/26/2024",
        formula(val) {
            this.raw = formatter(val)
        }
    }
})
let total = new DirectRenderMetric({
    title: "Total Savings",
    id: "total",
    Explanation: `
        This metric is calculated by adding the time saved from each of the other metrics.
    `,
    icon: <Badge>All Systems</Badge>,
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        costSavings: null,
        formula(value) {
            this.costSavings = value * defaultBillableHour
            this.raw = Math.trunc(value * 100) / 100
        }
    },
    value: {
        raw: null,
        unit: "Shifts saved ",
        collectionDateStart: "07/01/2023",
        formula(value) {
            this.raw = Math.trunc((value / 8) * 100) / 100
        }
    }
});

const allMetrics = {
    "Surplus": [
        ...metrics,
        poLineItemsMetric,
        poCreationCountMetric,
        importerMetric,
        photoUploadMetric,
    ],
    "Shop": [
        shopSavings
    ],
    "Equipment": [
        quoteBuilderMetrics
    ],
    "Procurement": [
        pricingSheetFoldersCreated
    ]
}
for (let [key, value] of Object.entries(allMetrics)) {
    let color = pallette[key];
    value.forEach(metric => {
        metric.group = key;
        if (!metric.systemBadgeName && !metric.system) return;
        metric.icon = <Tooltip label={metric.system}><Badge color={color}>{metric.systemBadgeName}</Badge></Tooltip>
    })
}

let allCategories = Object
    .keys(allMetrics)
    .reduce((acc, key) => {
        acc[key] = true;
        return acc
    }, {});
let allSystems = Object
    .keys(allMetrics)
    .reduce((acc, key) => {
        let category = key;
        let metrics = allMetrics[key];
        acc[category] = {}
        metrics.forEach(metric => {
            let system = metric.system;
            acc[category][system] = true
        })
        return acc
    }, {})


function useMetricsData(config) {
    const {data: shopUpdates, isPending: shopLoading} = useQuery({
        queryKey: ['shopUsage'], queryFn: async () => {
            const response = await fetch(`/api/logShopUsage`)
            return response.json()
        }
    });
    const {data: surpriceUsageData, isPending: surpriceLoading} = useQuery({
        queryKey: ['surpriceUsage'], queryFn: async () => {
            const response = await fetch("http://surprice.forsigma.com/api/getUsageData")
            return response.json()
        }
    });
    const {data: poData, isPending: poLoading} = useQuery({
        queryKey: ['costSheets'], queryFn: async () => {
            return await fetch("/api/costSheet?createdBy=Drive%20Parser")
                .then(res => res.json())
        }
    });
    const {data: quoteData, isPending: quoteLoading} = useQuery({
        queryKey: ['quotes'],
        queryFn: async () => {
            return await fetch('http://10.100.100.33:3007/api/usage')
                .then(res => res.json())
        }
    })
    const {data: importerData, isPending: importerLoading} = useQuery({
        queryKey: ['importer'],
        queryFn: async () => {
            return await fetch('/api/views/importer/approved_templates/count')
                .then(res => res.json())
                .then(data => data?.count ?? "")
        }
    });
    const {data: sheetCreationData, isPending: sheetCreationLoading} = useQuery({
        queryKey: ['pricingSheetFolders'],
        queryFn: async () => {
            return await fetch('/api/views/pricingSheets?success=true')
                .then(res => res.json())
        }
    });
    const updates = useUpdates("/api/views/photos", {total: true, parentOnly: true});
    let photosLoading = updates.length === 0;
    let photoData = photosLoading ? undefined : updates[0];
    let allLoaded = !surpriceLoading && !shopLoading && !poLoading && !quoteLoading && !importerLoading && !sheetCreationLoading && !photosLoading;
    let loadingStates = {
        shopLoading,
        surpriceLoading,
        poLoading,
        quoteLoading,
        importerLoading,
        sheetCreationLoading,
        photosLoading,
    };
    let data = {
        shopOrderProcessor: shopUpdates,
        surpriceUsageData,
        poData,
        quoteData,
        importerData,
        sheetCreationData,
        photoData
    }
    return {
        ...data,
        ...loadingStates,
        allLoaded
    }
}


const Celebration = () => {
    let catTotal = {}
    useUsage("Metrics", "celebration")
    const [shownCategories, setShownCategories] = useSetState(allCategories);
    const [shownSystems, setShownSystems] = useSetState(allSystems);
    const [showTimeSavings, setShowTimeSavings] = useState(true)
    const [confetti, setConfetti] = useLocalStorage({
        key: "confetti", defaultValue: true
    });
    const metricsData = useMetricsData()
    const {
        shopOrderProcessor: shopUpdates,
        surpriceUsageData,
        poData,
        quoteData,
        importerData,
        sheetCreationData,
        photoData,
        shopLoading,
        surpriceLoading,
        poLoading,
        quoteLoading,
        importerLoading,
        sheetCreationLoading,
        photosLoading,
        allLoaded
    } = metricsData;

    for (let [key, value] of Object.entries(allMetrics)) {
        value.forEach(metric => {
            let shownCategory = shownCategories[key];
            let shownCategorySystem = shownSystems[key][metric.system];
            metric.shown = shownCategory && shownCategorySystem;
        })
    }

    if (!sheetCreationLoading) {
        pricingSheetFoldersCreated.render(sheetCreationData.length)
    }

    if (!quoteLoading) {
        quoteBuilderMetrics.render(quoteData.length)
    }

    if (!photosLoading) {
        console.log(photoData)
        photoUploadMetric.render(photoData.count)
    }

    if (!importerLoading) {
        importerMetric.render(importerData)
    }

    if (!shopLoading) {
        shopSavings.render(shopUpdates[0] || 0)
    }

    if (!poLoading) {
        const PoCount = poData.rows.length;
        const PoItemTotal = poData.rows.reduce((acc, row) => acc + row['sheet_item_count'], 0);
        poLineItemsMetric.render(PoItemTotal);
        poCreationCountMetric.render(PoCount);
    }

    if (!surpriceLoading) {
        metrics.forEach(metric => metric.render(surpriceUsageData))
    }


    let systemsTotals = {};
    let totalSaved = 0;
    let metricList = Object.values(allMetrics).flat();
    let entries = Object.entries(allMetrics);

    entries.forEach(([key, value]) => {
        if (!Array.isArray(value)) return

        function sumCatSavings(metric) {
            if (!catTotal[key]) catTotal[key] = 0;
            if (!metric.shown) return;
            catTotal[key] += metric.timeSavings.raw
        }

        function sumSysSavings(systemName) {
            let metrics = metricList.filter(metric => metric.system === systemName);
            if (!systemsTotals[key]) {
                systemsTotals[key] = {}
            }
            systemsTotals[key][systemName] = metrics.reduce((acc, metric) => acc + metric.timeSavings.raw, 0)
        }

        value.forEach(sumCatSavings)
        Object.keys(shownSystems[key]).forEach(sumSysSavings)
    });

    totalSaved = metricList
        .filter(metric => metric.shown)
        .reduce((acc, metric) => acc + metric.timeSavings.raw, 0);

    metricList.forEach(metric => metric.timeSavings.costSavings = metric.timeSavings.raw * defaultBillableHour);
    total.render(totalSaved);

    return (
        <Container size={'responsive'}>
            <Grid justify={"flex-start"} my={'xl'}>
                <Grid.Col span={3}>
                    <Flex direction={'column'} justify={'flex-start'} gap={'.5rem'}>
                        <Switch
                            label={'Show Confetti'}
                            checked={confetti}
                            onChange={() => setConfetti(!confetti)}
                            size={'md'}
                            thumbIcon={confetti ? <IconConfetti
                                style={{width: rem(12), height: rem(12)}}
                                color={'teal'}
                                stroke={2}
                            /> : <IconConfettiOff
                                style={{width: rem(12), height: rem(12)}}
                                color={'gray'}
                                stroke={2}
                            />}
                        />
                        <Switch
                            label={showTimeSavings ? 'Show Cost Savings' : "Show Time Savings"}
                            checked={!showTimeSavings}
                            onChange={() => setShowTimeSavings(!showTimeSavings)}
                            size={'md'}
                            thumbIcon={showTimeSavings ? <IconClock
                                style={{width: rem(12), height: rem(12)}}
                                color={'teal'}
                                stroke={2}
                            /> : <IconCurrencyDollar
                                style={{width: rem(12), height: rem(12)}}
                                color={'gray'}
                                stroke={2}
                            />}
                        />
                    </Flex>
                </Grid.Col>
                <Grid.Col py={0} span={6}>
                    <Title
                        my={0}
                        py={0}
                        ta={'center'}
                    >
                        🎉 Automation Celebration 🎉
                    </Title>
                </Grid.Col>
                <Grid.Col span={3}></Grid.Col>
            </Grid>
            <Space h={'2rem'}/>
            <Group align={'center'} justify={'center'}>
                        {Object.keys(pallette).map((key, i) => {
                                let baseColor = pallette[key];
                            let percentTotal = `${catTotal?.[key] === 0 ? 0 : trunc(catTotal?.[key] / Number(totalSaved) * 100)}% of total`
                            let timeSavedLabel = `${formatter(trunc(catTotal?.[key]))} hrs saved ${percentTotal}` ?? "Loading";
                            let costSavedLabel = `${formatter(trunc(catTotal?.[key] * defaultBillableHour), 'currency')} dollars saved ${percentTotal}` ?? "Loading";
                            let label = showTimeSavings ? timeSavedLabel : costSavedLabel;
                                return (
                                    <SwatchMenu
                                        key={i}
                                        label={label}
                                        clickHandler={() => setShownCategories({[key]: !shownCategories[key]})}
                                        menuItems={Object.keys(shownSystems[key]).map((system, i) => {
                                            let shown = shownSystems[key][system];
                                            let systemSavings = systemsTotals?.[key]?.[system] ?? 0;
                                            let displaySavings = showTimeSavings ? systemSavings : systemSavings * defaultBillableHour;
                                            let suffix = showTimeSavings ? ' hrs saved' : ' dollars saved';
                                            let prefix = showTimeSavings ? '' : '$';
                                            let color = shown ? "green" : "red";
                                            const menuItemClickHandler = () => {
                                                setShownSystems((prev) => ({[key]: {...prev[key], ...{[system]: !shown}}}))
                                            }
                                            return {
                                                itemProps: {
                                                    leftSection: <ColorSwatch size={10} color={color}/>,
                                                    rightSection: <Text fz={'sm'} c={'dimmed'}>
                                                        {
                                                            shown && <>
                                                                <NumberFormatter
                                                                    decimalScale={2}
                                                                    thousandSeparator
                                                                    value={displaySavings}
                                                                    prefix={prefix}
                                                                    suffix={suffix}
                                                                />
                                                                <Text span fz={'xs'} c={'dimmed'}>
                                                                    {" "}
                                                                    (
                                                                    <NumberFormatter
                                                                        decimalScale={2}
                                                                        value={systemSavings / catTotal[key] * 100}
                                                                        suffix={'%'}
                                                                    />
                                                                    )
                                                                </Text>
                                                            </>
                                                        }
                                                    </Text>,
                                                    onClick: menuItemClickHandler
                                                },
                                                text: <Text fw={700} tt="capitalize" fz={'md'}>{system}</Text>
                                            }
                                        })}
                                        color={shownCategories[key] ? baseColor : "grey"}
                                        metricKey={key}
                                    />
                                )
                            }
                        )}
                </Group>
            {confetti && <Confetti/>}
            <SimpleGrid mt={'xl'} cols={1}>
                <CelebrationCard
                    id={'total'}
                    loading={!allLoaded}
                    showCostSavings={!showTimeSavings}
                    extraTagLine={`${trunc(+total?.value?.raw / 250)} Years of work saved.`}
                    metric={total}
                />
                </SimpleGrid>
            <SimpleGrid mb={'xl'} mt={'md'} cols={{base: 1, lg: 2, xl: 3}}>
                <CelebrationCard loading={photosLoading} showCostSavings={!showTimeSavings} metric={photoUploadMetric}/>
                {metrics.map((metric, i) =>
                    (
                        <CelebrationCard key={i} loading={surpriceLoading} showCostSavings={!showTimeSavings}
                                         metric={metric}/>
                    ))
                }
                <CelebrationCard loading={poLoading} showCostSavings={!showTimeSavings} metric={poLineItemsMetric}/>
                <CelebrationCard loading={poLoading} showCostSavings={!showTimeSavings} metric={poCreationCountMetric}/>
                <CelebrationCard loading={sheetCreationLoading} showCostSavings={!showTimeSavings}
                                 metric={pricingSheetFoldersCreated}/>
                <CelebrationCard loading={importerLoading} showCostSavings={!showTimeSavings} metric={importerMetric}/>
                <CelebrationCard loading={shopLoading} showCostSavings={!showTimeSavings} metric={shopSavings}/>
                <CelebrationCard loading={quoteLoading} showCostSavings={!showTimeSavings}
                                 metric={quoteBuilderMetrics}/>
            </SimpleGrid>
        </Container>
    );
};

export default Celebration;