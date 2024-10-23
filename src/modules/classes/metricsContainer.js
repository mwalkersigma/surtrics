import {Badge, Tooltip} from "@mantine/core";
import React from "react";
import {defaultBillableHour} from "../../pages/celebration/metrics";


export default class MetricsContainer {
    constructor(palette) {
        this.metrics = {}
        this.systemTotals = {}
        this.catTotal = {}
        this.palette = palette;
    }

    addMetric(department, metric) {
        if (!this.metrics[department]) this.metrics[department] = []
        this.metrics[department].push(metric)
    }

    populateBadges() {
        for (let [key, value] of Object.entries(this.metrics)) {
            let color = this.palette[key];
            value.forEach(metric => {
                metric.group = key;
                if (!metric.systemBadgeName && !metric.system) return;
                metric.icon =
                    <Tooltip label={metric.system}><Badge color={color}>{metric.systemBadgeName}</Badge></Tooltip>
            })
        }
    }

    get allCategories() {
        return Object
            .keys(this.metrics)
            .reduce((acc, key) => {
                acc[key] = true;
                return acc
            }, {});
    }

    get allSystems() {
        return Object
            .keys(this.metrics)
            .reduce((acc, key) => {
                let category = key;
                let metrics = this.metrics[key];
                acc[category] = {}
                metrics.forEach(metric => {
                    let system = metric.system;
                    acc[category][system] = true
                })
                return acc
            }, {})
    }

    get metricList() {
        return Object.values(this.metrics).flat();
    }

    get entries() {
        return Object.entries(this.metrics);
    }

    updateShown(shownCategories, shownSystems) {
        for (let [key, value] of Object.entries(this.metrics)) {
            value.forEach(metric => {
                let shownCategory = shownCategories[key];
                let shownCategorySystem = shownSystems[key][metric.system];
                metric.shown = shownCategory && shownCategorySystem;
            })
        }
    }

    updateTotals(shownCategories, shownSystems) {
        let metricList = this.metricList;
        let that = this;
        this.entries.forEach(([key, value]) => {
            if (!Array.isArray(value)) return

            function sumCatSavings(metric) {
                if (!that.catTotal[key]) that.catTotal[key] = 0;
                if (!metric.shown) return;
                that.catTotal[key] += metric.timeSavings.raw
            }

            function sumSysSavings(systemName) {
                let metrics = metricList.filter(metric => metric.system === systemName);
                if (!that.systemTotals[key]) {
                    that.systemTotals[key] = {}
                }
                that.systemTotals[key][systemName] = metrics.reduce((acc, metric) => acc + metric.timeSavings.raw, 0)
            }

            value.forEach(sumCatSavings)
            Object.keys(shownSystems[key]).forEach(sumSysSavings)
        });
    }

    updateCostSavings() {
        this.metricList.forEach(metric => metric.timeSavings.costSavings = metric.timeSavings.raw * defaultBillableHour);
    }
}