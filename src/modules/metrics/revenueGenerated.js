import MetricsContainer from "../classes/metricsContainer";
import {CostMetrics, DirectRenderMetric} from "../classes/metric";
import {Badge} from "@mantine/core";
import React from "react";
import {defaultBillableHour, palette, totalSavedSymbol} from "./consts";

function backwardsTimeSave(dollarsSaved) {
    return dollarsSaved / defaultBillableHour
}

const revenueGeneratedMetrics = new MetricsContainer(palette, false);
revenueGeneratedMetrics.addMetric("Surplus", new CostMetrics({
    title: "Restock Notifications Script",
    Explanation: `
        This script runs every morning at 5am and finds every transaction that sold the last piece in refurbished condition.
        It then checks to see if there are any used items available to restock from. If there are, it creates a notification.
        The notification includes the potential revenue from restocking the item. 
    `,
    systemBadgeName: "Restock",
    system: "Restock Notifications",
    loadingGroup: "restockLoading",
    dataUrl: "/api/views/restockNotifications",
    valueGetter: (data) => data,
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        costSavings: null,
        formula(value) {
            let generatedRev = value
                .map(item => Number(item['potential_revenue']))
                .reduce((acc, val) => acc + val, 0)
            this.raw = backwardsTimeSave(generatedRev)
            this.costSavings = generatedRev
        }
    },
    value: {
        raw: null,
        unit: "Items Found",
        collectionDateStart: "09/30/2023",
        formula(value) {
            this.raw = value.length
        }
    }

}))
revenueGeneratedMetrics.addMetric("Equipment", new CostMetrics({
    title: "Quote Builder Sold Quotes",
    valueGetter: (quoteData) => quoteData,
    dataUrl: "/api/views/quotes/withSales",
    loadingGroup: "quoteWithSalesLoading",
    Explanation: `
        The quote builder generates quotes based on insightly opportunities.
        This allows us to quickly generate quotes that follow a consistent format.
        These quotes have been linked to won opps in insightly.
    `,
    systemBadgeName: "Quote Builder",
    system: "Quote Builder",
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(val) {
            let revGenerated = val
                .filter(quoteRecord => quoteRecord.sale_price !== null)
                .reduce((acc, quoteRecord) => acc + quoteRecord.sale_price, 0)
            this.raw = backwardsTimeSave(revGenerated)
            this.costSavings = revGenerated

        }
    },
    value: {
        raw: null,
        unit: "generated quotes sold.",
        collectionDateStart: "08/07/2024",
        formula(val) {
            this.raw = val.length
            this.costSavings = val.length
        }
    }
}))


export let revenueGenereatedTotal = new DirectRenderMetric({
    title: "Total Revenue Generated",
    id: "total",
    Explanation: `
        This metric is calculated by adding the time saved from each of the other metrics.
    `,
    icon: <Badge>All Systems</Badge>,
    loadingGroup: "anyLoaded",
    valueGetter: (data) => data[totalSavedSymbol],
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
        unit: "Revenue directly linked to automation",
        collectionDateStart: "07/01/2023",
        extraTagValue: null,
        extraTagUnit: "Years of work saved.",
        formula() {
            this.raw = null
            this.extraTagValue = null
        }
    }
});

export default revenueGeneratedMetrics;