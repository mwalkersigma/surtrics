import MetricsContainer from "../classes/metricsContainer";
import {CostMetrics} from "../classes/metric";
import {Badge} from "@mantine/core";
import React from "react";
import {defaultBillableHour, localMetric, palette, totalSavedSymbol} from "./consts";
import {differenceInCalendarDays} from "date-fns";

function backwardsTimeSave(dollarsSaved) {
    return dollarsSaved / defaultBillableHour
}


const costAvoidanceMetrics = new MetricsContainer(palette);
costAvoidanceMetrics.addMetric("HR", new CostMetrics({
    title: "Train For SIGMA",
    Explanation: `
        Based on researching LMS systems online, for an organization of our size, we would expect to pay around $70,000 for a dedicated LMS system.
        By building our own custom system in house, we do not have to pay this cost. We also get a far greater level of customization and control.
    `,
    loadingGroup: localMetric,
    systemBadgeName: "Train",
    system: "Train for SIGMA",
    timeSavings: {
        raw: null,
        unit: "hrs saved",
        collectionDateStart: "05/01/2024",
        formula() {
            let startDate = new Date(this.collectionDateStart)
            let costPerYear = 70000
            let costPerDay = costPerYear / 365
            let daysSince = differenceInCalendarDays(new Date(), startDate)
            this.costSavings = costPerDay * daysSince
            this.raw = backwardsTimeSave(costPerDay * daysSince)
        }
    },
    value: {
        raw: null,
        unit: "days in service",
        collectionDateStart: "05/01/2024",
        formula() {
            this.raw = differenceInCalendarDays(new Date(), new Date(this.collectionDateStart))
        }
    }
}))
export let costAvoidedTotal = new CostMetrics({
    title: "Total Costs Avoided",
    id: "total",
    Explanation: `
        This metric is calculated by adding the time saved from each of the other metrics.
    `,
    icon: <Badge>All Systems</Badge>,
    loadingGroup: 'anyLoaded',
    valueGetter: (data) => data[totalSavedSymbol],
    timeSavings: {
        raw: null,
        unit: "hrs saved",
        costSavings: null,
        formula(value) {
            this.costSavings = value * defaultBillableHour
            this.raw = Math.trunc(value * 100) / 100
        }
    },
    value: {
        raw: null,
        unit: "Costs Avoided by Automation",
        collectionDateStart: "05/01/2024",
        formula(value) {
        }
    }
});

export default costAvoidanceMetrics;