import React from 'react';
import {Badge, ColorSwatch, Group, Paper, rem, SimpleGrid, Switch, Text, Title, Tooltip} from "@mantine/core";
import {IconConfetti, IconConfettiOff} from "@tabler/icons-react";
import formatter from "../modules/utils/numberFormatter";
import GraphWithStatCard from "../components/mantine/graphWithStatCard";
import Confetti from "../components/confetti";
import {eachWeekOfInterval} from "date-fns";
import useUsage from "../modules/hooks/useUsage";
import {useLocalStorage} from "@mantine/hooks";
import Metric from "../modules/classes/metric";
import {useQuery} from "@tanstack/react-query";
import Head from 'next/head'

function trunc(value) {
    if (!value) return null;
    return Math.trunc(value * 100) / 100
}

function directRender(val) {
    this.value.formula(val)
    this.timeSavings.formula(val)
}

const pallette = {
    "Surplus":   "#7e1416",
    "Shop":      "#0ea40e",
    "Equipment": "#be6828",
}
const metrics = [
    new Metric({
        title:       "Surprice Pricing Sheet Auto Complete", Explanation: `
            This metric is calculated by estimating that 
            it takes approximately 3 minutes to research each model number in a pricing sheet. 
            Consecutive runs of the sheet are not counted as time saved since the data must 
            be researched for the sheet each time. Each model number is counted only once.
        `, icon: <Badge color={pallette['Surplus']}>Surprice</Badge>,
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula(value) {
                this.raw = (value * 3 / 60)
            }
        },
        value:       {
            raw:  null,
            unit: "Rows found first run",
            collectionDateStart: "07/01/2023",
            formula(value) {
                this.raw = formatter(value)
            }
        }, values:   [
            "updateSheet.FoundFirstRun"
        ]
    }),
    new Metric({
        title:     "Surplus listing Duplicate Checker", Explanation: `
            This metric uses the results of a time study preformed by Libby 
            that concluded it takes roughly 12.149 seconds to research each 
            model number in a surplus listing.
            
            The time saved is calculated by multiplying the number of
            model numbers found by 12.149 seconds and converting the result to hours.
        `, icon: <Badge color={pallette['Surplus']}>Surprice</Badge>, timeSavings: {
            raw: null, unit: "Hrs saved", formula(value) {
                this.raw = ((value + 16430 * 12.149) / 3600)
            }
        }, value:  {
            raw: null, unit: "Model numbers checked", collectionDateStart: "12/13/2023", formula(value) {
                this.raw = formatter(value + 16430)
            }
        }, values: [
            "API.findDuplicate", "API.find duplicates"
        ]
    }),
    new Metric({
        title:     "Channel Advisor Auto Pricing ", Explanation: `
            This metric increments each time a price is sent to channel advisor by the drive parser.
            This process takes around 6 hours to complete 100 parents Skus ( 400 child skus ).
            This works out to 3.5 minutes per parent sku.
            
            The time saved is calculated by multiplying the number of prices divided by 4 times 3.5 minutes each and converting the result to hours.
        `, icon: <Badge color={pallette['Surplus']}>Drive Parser</Badge>, timeSavings: {
            raw: null, unit: "Hrs saved", formula(value) {
                this.raw = (((value / 4) * 3.5) / 60)
            }
        }, value:  {
            raw: null, unit: "Prices Sent", collectionDateStart: "12/13/2023", formula(value) {
                this.raw = formatter(value)
            }
        }, values: [
            "API.priceUpdated",
        ]
    }),
    new Metric({
        title:       "Surplus Metrics Tracking", Explanation: `
            When manually tracking surplus metrics, it takes on average 10 minutes ( between 5 and 15 ) to
            update the surplus metrics tracking sheet. This metric calculates the time
            saved by multiplying the number of weeks since surtrics was implemented by
            times 5 work days, time 3 updates per day, and then converting the result to hours.
        `, icon: <Badge color={pallette['Surplus']}>Surtrics</Badge>,
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
];

const poLineItemsMetric = new Metric({
    title:       "Po Line Item Creation",
    Explanation: `
            Based on a time study conducted by Libby, it takes on average 63 seconds to add an item into inventory from 
            from manual PO creation. so we take the number of items added and multiply by 63 seconds and convert to hours.
        `, icon: <Badge color={pallette['Surplus']}>Drive Parser</Badge>,
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
const poCreationCountMetric = new Metric({
    title:       "PO Creation",
    Explanation: `
            Each Po that is created with the Drive Parser is a huge victory.
            It allows : 
                Costs to be assigned to each PO line item so in the future every item in Sku Vault has a cost.
                Pricing to be sent to Channel Advisor for every item on the PO.
                No one in BSA has to manually create a cost sheet and submit manual costs at the sku level.
                This can sometimes take up to 8 hours to complete.
    `,
    icon:        <Badge color={pallette['Surplus']}> Drive Parser </Badge>,
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

let shopSavings = new Metric({
    title:       "Shop Orders Sent To Insightly",
    Explanation: `
        When an order is placed on the surplus website by the SHOP it is automatically sent to Insightly. 
        This metric counts the number of orders sent to Insightly.
        Each order After being placed took around 15 minutes in the past to be manually entered into Insightly.
        `,
    icon:        <Badge color={pallette['Shop']}>Shop Order Finder</Badge>,
    timeSavings: {
        raw:  null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = (val * 15 / 60)
        }
    },
    value:       {
        raw:                 null,
        unit:                "Orders sent",
        collectionDateStart: "02/20/2024",
        formula(val) {
            this.raw = formatter(val)
        }
    },
});
const quoteBuilderMetrics = new Metric({
    title:       "Quote Builder Automation",
    explanation: `
        The quote builder generates quotes based on insightly opportunities.
        This allows us to quickly generate quotes that follow a consistent format.
    `,
    icon:        <Badge color={pallette['Equipment']}>Quote Builder</Badge>,
    timeSavings: {
        raw:  null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = (val * 120 / 60 / 60)
        }
    },
    value:       {
        raw:                 null,
        unit:                "Quotes generated",
        collectionDateStart: "02/20/2024",
        formula(val) {
            this.raw = formatter(val)
        }
    }
});

const importerMetric = new Metric({
    title:       "Importer Template Approvals",
    explanation: `
        The importer allows us to quickly approve templates that have been submitted by vendors.
    `,
    icon:        <Badge color={pallette['Surplus']}>Importer</Badge>,
    timeSavings: {
        raw:  null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = Math.trunc(val * 2 / 60 * 100) / 100
        }
    },
    value:       {
        raw:                 null,
        unit:                "Templates approved",
        collectionDateStart: "02/20/2024",
        formula(val) {
            this.raw = formatter(val)
        }
    }
})

let total = new Metric({
    title:       "Total Time Saved", id: "total", Explanation: `
        This metric is calculated by adding the time saved from each of the other metrics.
    `, icon: <Badge>All Systems</Badge>,
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(offset) {
            let filteredList = metrics.filter(metric => metric.title !== "Total Time Saved");
            let sum = filteredList.reduce((acc, metric) => acc + +metric.timeSavings.raw, 0);
            if (offset) sum += offset
            this.raw = Math.trunc(sum * 100) / 100
        }
    }, value:    {
        raw: null, unit: "Shifts saved ", collectionDateStart: "07/01/2023", formula(offset) {
            let filteredList = metrics.filter(metric => metric.title !== "Total Time Saved");
            let sum = filteredList.reduce((acc, metric) => acc + +metric.timeSavings.raw, 0)
            if (offset) sum += offset
            this.raw = Math.trunc((sum / 8) * 100) / 100
        }
    }
});
total.render = function (offset) {
    this.timeSavings.formula(offset)
    this.value.formula(offset)
}

function CelebrationCard({metric, id}) {

    return (<Tooltip
        multiline
        withArrow
        label={metric.Explanation}
        w={220}
        transitionProps={{
            duration: 200
        }}
    >
        <Paper p={"1rem 1.5rem"} withBorder>

            <Group mb={'md'} justify={'space-between'} align={'center'}>
                <Text> {metric.title} </Text>
                {metric.icon}
            </Group>

            <Group mb={'md'} align={'end'}>
                <Title id={id} c={'teal'}> {formatter(trunc(metric.timeSavings?.raw) ?? '0')} </Title>
                <Text> {metric.timeSavings?.unit ?? ""} </Text>
            </Group>

            <Group c={'dimmed'} justify={'space-between'}>
                <Text fz={'xs'}> {metric.value.raw} {metric.value?.unit ?? ""}  </Text>
                <Text fz={'xs'}> Start Date {metric.value?.collectionDateStart ?? ""} </Text>
            </Group>

        </Paper>
    </Tooltip>)
}


shopSavings.render = directRender;
poLineItemsMetric.render = directRender;
poCreationCountMetric.render = directRender;
quoteBuilderMetrics.render = directRender;
importerMetric.render = directRender;


const Celebration = () => {
    useUsage("Metrics", "celebration")
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
        queryFn:  async () => {
            return await fetch('http://localhost:3007/api/usage')
                .then(res => res.json())
        }
    })
    const {data: importerData, isPending: importerLoading} = useQuery({
        queryKey: ['importer'],
        queryFn:  async () => {
            return await fetch('/api/views/importer/approved_templates/count')
                .then(res => res.json())
                .then(data => data?.count ?? "")
        }
    });

    const [confetti, setConfetti] = useLocalStorage({
        key: "confetti", defaultValue: true
    });

    if (!quoteLoading) {
        quoteBuilderMetrics.render(quoteData.length)
    }

    if (!importerLoading) {
        importerMetric.render(importerData)
    }

    if (!poLoading) {
        const PoCount = poData.rows.length;
        const PoItemTotal = poData.rows.reduce((acc, row) => acc + row['sheet_item_count'], 0);
        poLineItemsMetric.render(PoItemTotal);
        poCreationCountMetric.render(PoCount);
    }

    if (!shopLoading) {
        shopSavings.render(shopUpdates[0] || 0)
    }

    if (!surpriceLoading) {
        metrics.forEach(metric => metric.render(surpriceUsageData))
    }
    let shopOffset = shopLoading ? 0 : +shopSavings.timeSavings.raw;
    let poLineItemOffset = poLoading ? 0 : +poLineItemsMetric.timeSavings.raw;
    let poCreationOffset = poLoading ? 0 : +poCreationCountMetric.timeSavings.raw;
    let quotesOffset = quoteLoading ? 0 : +quoteBuilderMetrics.timeSavings.raw;
    let importerOffset = importerLoading ? 0 : +importerMetric.timeSavings.raw;
    let totalOffset = shopOffset + poLineItemOffset + poCreationOffset + quotesOffset + importerOffset;
    if (!surpriceLoading) {
        total.render(totalOffset);
    }

    console.log("Render")
    return (<span>
            <Head>
                <script type={'application/ld+json'}>
                    {JSON.stringify({total})}
                </script>
            </Head>
            <GraphWithStatCard noBorder title={'🎉 Automation Celebration 🎉'}>
                <SimpleGrid cols={3}>
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
                    <Group>
                        {Object.keys(pallette).map((key, i) => {
                            return <Group key={i}> <ColorSwatch color={pallette[key]}/> <Text>{key}</Text> </Group>
                        })}
                    </Group>
                </SimpleGrid>

                {confetti && <Confetti/>}
                <SimpleGrid mt={'xl'} cols={1}>
                    {!surpriceLoading && <CelebrationCard id={'total'} metric={total}/>}
                </SimpleGrid>
                <SimpleGrid mb={'xl'} mt={'md'} cols={3}>
                    {!surpriceLoading && metrics.map((metric, i) => <CelebrationCard key={i} metric={metric}/>)}
                    {!shopLoading && <CelebrationCard metric={shopSavings}/>}
                    {!poLoading && <>
                        <CelebrationCard metric={poLineItemsMetric}/>
                        <CelebrationCard metric={poCreationCountMetric}/>
                    </>}
                    {!quoteLoading && <CelebrationCard metric={quoteBuilderMetrics}/>}
                    {!importerLoading && <CelebrationCard metric={importerMetric}/>}
                </SimpleGrid>
            </GraphWithStatCard>
        </span>

    );
};

export default Celebration;