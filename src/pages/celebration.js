import React from 'react';
import {Group, Paper, rem, SimpleGrid, Switch, Text, Title, Tooltip} from "@mantine/core";
import {
    IconClipboardData,
    IconConfetti,
    IconConfettiOff,
    IconCurrencyDollar,
    IconFilePlus,
    IconReceipt,
    IconSearch,
    IconTable
} from "@tabler/icons-react";
import formatter from "../modules/utils/numberFormatter";
import GraphWithStatCard from "../components/mantine/graphWithStatCard";
import Confetti from "../components/confetti";
import {eachWeekOfInterval} from "date-fns";
import useUsage from "../modules/hooks/useUsage";
import {useLocalStorage} from "@mantine/hooks";
import Metric from "../modules/classes/metric";
import {useQuery} from "@tanstack/react-query";
import Head from 'next/head'


const metrics = [
    new Metric({
        title: "Surprice Pricing Sheet Auto Complete",
        Explanation: `
            This metric is calculated by estimating that 
            it takes approximately 3 minutes to research each model number in a pricing sheet. 
            Consecutive runs of the sheet are not counted as time saved since the data must 
            be researched for the sheet each time. Each model number is counted only once.
        `,
        icon: <IconTable size={'1.5rem'}/>,
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula(value) {
                this.raw = formatter(value * 3 / 60)
            }
        },
        value: {
            raw: null,
            unit: "Rows found first run",
            collectionDateStart: "07/01/2023",
            formula(value) {
                this.raw = formatter(value)
            }
        },
        values: [
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
        icon: <IconSearch size={'1.5rem'}/>,
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula(value) {
                this.raw = formatter((value + 16430 * 12.149) / 3600)
            }
        },
        value: {
            raw: null,
            unit: "Model numbers checked",
            collectionDateStart: "12/13/2023",
            formula(value) {
                this.raw = formatter(value + 16430)
            }
        },
        values: [
            "API.findDuplicate",
            "API.find duplicates"
        ]
    }),
    new Metric({
        title: "Channel Advisor Pricing Automation",
        Explanation: `
            This metric increments each time a price is sent to channel advisor by the drive parser.
            This process takes around 6 hours to complete 100 parents Skus ( 400 child skus ).
            This works out to 3.5 minutes per parent sku.
            
            The time saved is calculated by multiplying the number of prices divided by 4 times 3.5 minutes each and converting the result to hours.
        `,
        icon: <IconCurrencyDollar size={'1.5rem'}/>,
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula(value) {
                this.raw = formatter(((value / 4) * 3.5) / 60)
            }
        },
        value: {
            raw: null,
            unit: "Prices Sent",
            collectionDateStart: "12/13/2023",
            formula(value) {
                this.raw = formatter(value)
            }
        },
        values: [
            "API.priceUpdated",
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
        icon: <IconClipboardData size={'1.5rem'}/>,
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula() {
                let startDate = new Date('09/04/2023')
                let weeks = eachWeekOfInterval(
                    {
                        start: startDate,
                        end: new Date()
                    }
                )
                this.raw = formatter(weeks.length * 5 * 3 * 10 / 60)
            }
        },
        value: {
            raw: null,
            unit: "Weeks active",
            collectionDateStart: "09/04/2023",
            formula() {
                let startDate = new Date('09/04/2023')
                let weeks = eachWeekOfInterval(
                    {start: startDate, end: new Date()}
                )
                this.raw = formatter(weeks.length)
            }
        },
    }),
    new Metric({
        title: "Po Line Item Creation",
        Explanation: `
            Based on a time study conducted by Libby, it takes on average 63 seconds to add an item into inventory from 
            from manual PO creation. so we take the number of items added and multiply by 63 seconds and convert to hours.
        `,
        icon: <IconFilePlus size={'1.5rem'}/>,
        timeSavings: {
            raw: null,
            unit: "Hrs saved",
            formula(value) {
                this.raw = formatter(((value) * 63) / 60 / 60)
            }
        },
        value: {
            raw: null,
            unit: "Lines generated on POs",
            collectionDateStart: "12/13/2023",
            formula(value) {
                this.raw = formatter(value)
            }
        },
        values: [
            "API.PO Line Item Created",
        ]
    })
]

let total = new Metric({
    title: "Total Time Saved",
    id: "total",
    Explanation: `
        This metric is calculated by adding the time saved from each of the other metrics.
    `,
    icon: <IconClipboardData size={'1.5rem'}/>,
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(offset) {
            let filteredList = metrics.filter(metric => metric.title !== "Total Time Saved");
            let sum = filteredList.reduce((acc, metric) => acc + +metric.timeSavings.raw.replace(/,/g, ''), 0);
            if (offset) sum += offset
            this.raw = formatter(sum)
        }
    },
    value: {
        raw: null,
        unit: "Shifts saved ",
        collectionDateStart: "07/01/2023",
        formula(offset) {
            let filteredList = metrics.filter(metric => metric.title !== "Total Time Saved");
            let sum = filteredList.reduce((acc, metric) => acc + +metric.timeSavings.raw.replace(/,/g, ''), 0)
            console.log(sum)
            console.log(offset)
            if (offset) sum += offset
            console.log(sum)
            this.raw = formatter(sum / 8)
        }
    }
});

total.render = function (offset) {
    this.timeSavings.formula(offset)
    this.value.formula(offset)
}

function CelebrationCard({metric, id}) {

    return (
        <Tooltip
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
                    <Title id={id} c={'teal'}> {metric.timeSavings.raw} </Title>
                    <Text> {metric.timeSavings.unit} </Text>
                </Group>

                <Group c={'dimmed'} justify={'space-between'}>
                    <Text fz={'xs'}> {metric.value.raw} {metric.value.unit}  </Text>
                    <Text fz={'xs'}> Start Date {metric.value.collectionDateStart} </Text>
                </Group>

            </Paper>
        </Tooltip>
    )
}

let shopSavings = new Metric({
    title: "Shop MRO Orders Sent To Insightly",
    Explanation: `
        When an order is placed on the surplus website by the SHOP it is automatically sent to Insightly. 
        This metric counts the number of orders sent to Insightly.
        Each order After being placed took around 15 minutes in the past to be manually entered into Insightly.
        `,
    icon: <IconReceipt size={'1.5rem'}/>,
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = formatter(val * 15 / 60)
        }
    },
    value: {
        raw: null,
        unit: "Orders sent",
        collectionDateStart: "02/20/2024",
        formula(val) {
            this.raw = formatter(val)
        }
    },
});

shopSavings.render = function (val) {
    this.value.formula(val)
    this.timeSavings.formula(val)
}

const Celebration = () => {
    const {data: shopUpdates, isLoading: shopLoading} = useQuery({
        queryKey: ['shopUsage'],
        queryFn: async () => {
            const response = await fetch(`/api/logShopUsage`)
            return response.json()
        }
    });
    const {data: surpriceUsageData, isLoading: surpriceLoading} = useQuery({
        queryKey: ['surpriceUsage'],
        queryFn: async () => {
            const response = await fetch("http://surprice.forsigma.com/api/getUsageData")
            return response.json()
        }
    });

    const [confetti, setConfetti] = useLocalStorage({
        key: "confetti",
        defaultValue: true
    });

    useUsage("Metrics", "celebration")


    if (surpriceLoading || shopLoading) {
        return <div>loading</div>
    }

    if (!surpriceLoading && !shopLoading) {
        shopSavings.render(shopUpdates[0] || 0)
        metrics.forEach(metric => metric.render(surpriceUsageData))
        total.render(+shopSavings.timeSavings.raw);
    }

    return (
        <span>
            <Head>
                <script type={'application/ld+json'}>
                    {JSON.stringify({total})}
                </script>
            </Head>
            <GraphWithStatCard noBorder title={'🎉 Sursuite Celebration 🎉'}>
                <Switch
                    label={'Show Confetti'}
                    checked={confetti}
                    onChange={() => setConfetti(!confetti)}
                    size={'md'}
                    // onLabel={<IconConfetti style={{width: rem(14), height: rem(14)}} color={'white'} stroke={2}/>}
                    // offLabel={<IconConfettiOff style={{width: rem(14), height: rem(14)}} color={'gray'} stroke={2}/>}
                    thumbIcon={
                        confetti
                            ? <IconConfetti
                                style={{width: rem(12), height: rem(12)}}
                                color={'teal'}
                                stroke={2}
                            />
                            : <IconConfettiOff
                                style={{width: rem(12), height: rem(12)}}
                                color={'gray'}
                                stroke={2}
                            />
                    }
                />
                {confetti && <Confetti/>}
                <SimpleGrid mt={'xl'} cols={1}>
                    <CelebrationCard id={'total'} metric={total}/>
                </SimpleGrid>
                <SimpleGrid mb={'xl'} mt={'md'} cols={3}>
                    {!shopLoading && !surpriceLoading &&
                        metrics.map((metric, i) => <CelebrationCard key={i} metric={metric}/>)
                    }
                    <CelebrationCard metric={shopSavings}/>
                </SimpleGrid>
            </GraphWithStatCard>
        </span>

    );
};

export default Celebration;