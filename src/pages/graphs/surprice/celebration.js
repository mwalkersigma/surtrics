import React, {useEffect, useState} from 'react';
import { Group, Paper, SimpleGrid, Text, Title, Tooltip } from "@mantine/core";
import {IconClipboardData, IconSearch} from "@tabler/icons-react";
import formatter from "../../../modules/utils/numberFormatter";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import Confetti from "../../../components/confetti";
import { eachWeekOfInterval } from "date-fns";



class Metric {
    constructor({title, Explanation, icon, timeSavings, value, values}) {
        this.title = title;
        this.Explanation = Explanation;
        this.icon = icon;
        this.timeSavings = timeSavings;
        this.value = value;
        this.values = values;
    }
    render(data){
        if(!this?.values){
            this.value.formula(0)
            this.timeSavings.formula(0)
            return;
        }
        let rawTotal = this.values.reduce((acc,value)=>{
            function getValue(input,key){
                return input[key]
            }
            let level;

            value
                .split('.')
                .forEach(key=>{
                    level = level ? getValue(level,key) : getValue(data,key)
                })

            return acc + level
        },0)
        this.value.formula(rawTotal)
        this.timeSavings.formula(rawTotal)
        return this;
    }
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
        icon: <IconSearch size={'1.5rem'} />,
        timeSavings :{
            raw: null,
            unit: "Hrs saved",
            formula(value){
                this.raw = formatter(value * 3 / 60)
            }
        },
        value : {
            raw: null,
            unit: "Rows found first run",
            collectionDateStart: "07/01/2023",
            formula(value){
                this.raw = formatter(value)
            }
        },
        values : [
            "updateSheet.FoundFirstRun"
        ]
    }),
    new Metric({
        title:"Surplus listing Duplicate Checker",
        Explanation: `
            This metric uses the results of a time study preformed by Libby 
            that concluded it takes roughly 12.149 seconds to research each 
            model number in a surplus listing.
            
            The time saved is calculated by multiplying the number of
            model numbers found by 12.149 seconds and converting the result to hours.
        `,
        icon: <IconSearch size={'1.5rem'} />,
        timeSavings :{
            raw: null,
            unit: "Hrs saved",
            formula(value){
                this.raw = formatter((value + 16430 * 12.149 ) / 3600)
            }
        },
        value : {
            raw: null,
            unit: "Model numbers checked",
            collectionDateStart: "12/13/2023",
            formula(value){
                this.raw = formatter(value + 16430)
            }
        },
        values: [
            "API.findDuplicate",
            "API.find duplicates"
        ]
    }),
    new Metric({
        title:"Surplus Metrics Tracking",
        Explanation: `
            When manually tracking surplus metrics, it takes on average 10 minutes ( between 5 and 15 ) to
            update the surplus metrics tracking sheet. This metric calculates the time
            saved by multiplying the number of weeks since surtrics was implemented by
            times 5 work days, time 3 updates per day, and then converting the result to hours.
        `,
        icon: <IconClipboardData size={'1.5rem'} />,
        timeSavings :{
            raw: null,
            unit: "Hrs saved",
            formula(){
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
        value : {
            raw: null,
            unit: "Weeks active",
            collectionDateStart: "09/04/2023",
            formula(){
                let startDate = new Date('09/04/2023')
                let weeks = eachWeekOfInterval(
                    {start: startDate, end: new Date()}
                )
                this.raw = formatter(weeks.length)
            }
        },
    }),
]

let total = new Metric({
    title: "Total Time Saved",
    Explanation: `
        This metric is calculated by adding the time saved from each of the other metrics.
    `,
    icon: <IconClipboardData size={'1.5rem'}/>,
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula() {
            let filteredList = metrics.filter(metric => metric.title !== "Total Time Saved");
            console.log(filteredList);
            let sum = filteredList.reduce((acc, metric) => acc + +metric.timeSavings.raw, 0)
            console.log(sum);
            this.raw = formatter(sum)
        }
    },
    value: {
        raw: null,
        unit: "Shifts saved ",
        collectionDateStart: "07/01/2023",
        formula() {
            let filteredList = metrics.filter(metric => metric.title !== "Total Time Saved");
            console.log(filteredList);
            let sum = filteredList.reduce((acc, metric) => acc + +metric.timeSavings.raw, 0)
            console.log(sum);
            this.raw = formatter(sum / 8)
        }
    }
})

function CelebrationCard ({metric}) {
    return (
        <Tooltip
            multiline
            withArrow
            label={metric.Explanation}
            w={220}
            transitionProps={{ duration: 200 }}
        >
            <Paper p={"1rem 1.5rem"} withBorder>

                <Group mb={'md'} justify={'space-between'} align={'center'}>
                    <Text> { metric.title } </Text>
                    { metric.icon }
                </Group>

                <Group mb={'md'} align={'end'}>
                    <Title> { metric.timeSavings.raw } </Title>
                    <Text> { metric.timeSavings.unit } </Text>
                </Group>

                <Group c={'dimmed'} justify={'space-between'} >
                    <Text fz={'sm'} > { metric.value.raw } { metric.value.unit }  </Text>
                    <Text fz={'sm'} > Start Date { metric.value.collectionDateStart } </Text>
                </Group>

            </Paper>
        </Tooltip>
    )
}



const Celebration = () => {
    //12.149
    const [surpriceUsageData, setSurpriceUsageData] = useState(null);

    useEffect(() => {
        fetch("http://surprice.forsigma.com/api/getUsageData")
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                setSurpriceUsageData(data);
            });
    }, []);

    if(!surpriceUsageData){
        return <div>loading...</div>
    }

    metrics.forEach(metric=>metric.render(surpriceUsageData))

    total.render();
    return (
        <GraphWithStatCard noBorder title={'🎉 Celebration 🎉'} >
            <Confetti/>
            <SimpleGrid mt={'xl'} cols={1}>
                <CelebrationCard metric={total}/>
            </SimpleGrid>
            <SimpleGrid mt={'md'} cols={3}>
                {metrics.map((metric, i) => <CelebrationCard key={i} metric={metric}/>)}
            </SimpleGrid>
        </GraphWithStatCard>
    );
};

export default Celebration;