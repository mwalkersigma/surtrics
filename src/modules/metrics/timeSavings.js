import MetricsContainer from "../classes/metricsContainer";
import Metric, {DirectRenderMetric} from "../classes/metric";
import formatter from "../utils/numberFormatter";
import {eachWeekOfInterval} from "date-fns";
import {Badge} from "@mantine/core";
import React from "react";
import trunc from "../utils/trunc";
import {defaultBillableHour, localMetric, palette, totalSavedSymbol} from "./consts";


const timeSavingsMetrics = new MetricsContainer(palette);
timeSavingsMetrics.addMetric("Surplus", new DirectRenderMetric({
    title: "Photos Uploaded",
    loadingGroup: "photosLoading",
    valueGetter: (photoData) => photoData[0]?.count ?? 0,
    dataUrl: "/api/views/photos/total",
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

}))

timeSavingsMetrics.addMetric("Surplus", new Metric({
    title: "Surprice Pricing Sheet Auto Complete",
    loadingGroup: "surpriceLoading",
    dataUrl: "http://surprice.forsigma.com/api/getUsageData",
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
    },
    values: [
        "updateSheet.FoundFirstRun"
    ]
}))
timeSavingsMetrics.addMetric("Surplus", new Metric({
    title: "Surplus listing Duplicate Checker",
    loadingGroup: "surpriceLoading",
    dataUrl: "http://surprice.forsigma.com/api/getUsageData",
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
}))
timeSavingsMetrics.addMetric("Surplus", new Metric({
    title: "Surplus Metrics Tracking",
    loadingGroup: localMetric,
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
}))
timeSavingsMetrics.addMetric("Surplus", new Metric({
    title: "Channel Advisor Auto Pricing ",
    loadingGroup: "surpriceLoading",
    dataUrl: "http://surprice.forsigma.com/api/getUsageData",
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
    },
    value: {
        raw: null, unit: "Prices Sent", collectionDateStart: "12/13/2023", formula(value) {
            this.raw = formatter(value)
        }
    },
    values: [
        "API.priceUpdated",
    ]
}))

timeSavingsMetrics.addMetric("Surplus", new DirectRenderMetric({
    title: "Po Line Item Creation",
    loadingGroup: "poLoading",
    valueGetter: (data) => data?.rows?.reduce((acc, row) => acc + row['sheet_item_count'], 0),
    dataUrl: "/api/costSheet?createdBy=Drive%20Parser",
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
}))
timeSavingsMetrics.addMetric("Surplus", new DirectRenderMetric({
    title: "PO Creation",
    loadingGroup: "poLoading",
    valueGetter: (poData) => poData.rows.length,
    dataUrl: "/api/costSheet?createdBy=Drive%20Parser",
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
}))
timeSavingsMetrics.addMetric("Surplus", new DirectRenderMetric({
    title: "Importer Template Approvals",
    loadingGroup: "importerLoading",
    valueGetter: (importerData) => importerData?.count ?? 0,
    dataUrl: "/api/views/importer/approved_templates/count",
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
}))

timeSavingsMetrics.addMetric("Shop", new DirectRenderMetric({
    title: "Shop Orders Sent To Insightly",
    loadingGroup: "shopLoading",
    valueGetter: (shopUpdates) => shopUpdates[0] ?? 0,
    dataUrl: "/api/logShopUsage",
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
}))

timeSavingsMetrics.addMetric("Equipment", new DirectRenderMetric({
    title: "Quote Builder Automation",
    valueGetter: (quoteData) => quoteData.length,
    dataUrl: "/api/views/quotes",
    loadingGroup: "quoteLoading",
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
}))

timeSavingsMetrics.addMetric("Procurement", new DirectRenderMetric({
    title: "Pricing Sheet Folders Created",
    Explanation: `
        Pricing Folders are generated when an insightly Parts opportunity is moved to stage 3.
        When preformed manually this process takes 1 min 56.33 secs on average to complete. 
        This includes finding the document sequence number, finding the insightly opp id, creating a folder
        with a properly formatted title and cloning the pricing sheet template and creating a photos folder.
        and putting all of that into the procurements folder so that it can be processed by the drive parser. 
        and adding a link to the folder in insightly.
    `,
    dataUrl: "/api/views/pricingSheets?success=true",
    system: "Price Sheet Maker",
    systemBadgeName: "Sheet Maker",
    loadingGroup: "sheetCreationLoading",
    timeSavings: {
        raw: null,
        unit: "Hrs saved",
        formula(val) {
            this.raw = trunc(val.length * 116 / 60 / 60)
        }
    },
    value: {
        raw: null,
        unit: "Folders created",
        collectionDateStart: "02/26/2024",
        formula(val) {
            this.raw = formatter(val.length)
        }
    }
}))
export let total = new DirectRenderMetric({
    title: "Total Time Savings",
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
        unit: "Shifts saved ",
        collectionDateStart: "07/01/2023",
        extraTagValue: null,
        extraTagUnit: "Years of work saved.",
        formula(value) {
            let shiftsSaved = trunc(value / 8)
            this.raw = shiftsSaved
            this.extraTagValue = trunc(shiftsSaved / 250)
        }
    }
});

export default timeSavingsMetrics;