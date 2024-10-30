import Metric, {CostMetrics, DirectRenderMetric, RevenueMetrics} from "./metric";
import {localMetric} from "../metrics/consts";

function isClass(classToCheck) {
    return (item) => {
        let isInstance = item instanceof classToCheck;
        let hasCorrectName = item.constructor.name === classToCheck.name;
        let hasCorrectPrototype = item.prototype === classToCheck.prototype;
        let hasCorrectConstructor = String(item.constructor) === classToCheck.name;
        return isInstance || hasCorrectName || hasCorrectPrototype || hasCorrectConstructor;
    }
}

function isBaseMetric(item) {
    return isClass(Metric)(item);
}

function isDirectRenderMetric(item) {
    return isClass(DirectRenderMetric)(item);
}

function isCostMetric(item) {
    return isClass(CostMetrics)(item);
}

function isRevenueMetric(item) {
    return isClass(RevenueMetrics)(item);
}

function isMetric(item) {
    return isBaseMetric(item) || isDirectRenderMetric(item) || isCostMetric(item) || isRevenueMetric(item);
}

export default class LoadObserver {
    constructor() {
        this.ids = [];
        this.state = new Map();
        this.state.set(localMetric, {listeners: []});
        this.previousState = null;
        this.dataState = null;
        this[localMetric] = [];
    }

    registerState = (key, loadingState) => {
        this.state.set(key, {
            value: loadingState,
            listeners: []
        });
    }
    registerStateObject = (loadingStateObject) => {
        for (let [key, value] of Object.entries(loadingStateObject)) {
            this.registerState(key, value);
        }
    }
    registerDataObject = (dataObject) => {
        this.dataState = dataObject;
    }
    registerStateAndDataObject = ({loadingStates, data}) => {
        this.registerStateObject(loadingStates);
        this.registerDataObject(data);
    }
    registerListener = (key, listener, valueFn = (v) => v) => {
        this.state.get(key).listeners.push([listener, valueFn]);
    }
    registerMetric = (metric) => {
        if (isMetric(metric)) {
            let defaultGetter = (data) => data;
            let getter = metric?.valueGetter ?? defaultGetter;
            this.state.get(metric.loadingGroup)?.listeners.push([metric.render, getter]);
        } else {
            console.log(metric);
            throw new Error("Invalid Metric Type")
        }
    }
    updateState = (key, value, shouldRun = true) => {
        this.state.get(key).value = value;
        if (shouldRun) this.run();
    }
    updateAllState = (loadingStateObject, shouldRun = true) => {
        for (let [key, value] of Object.entries(loadingStateObject)) {
            this.updateState(key, value, false);
        }
        if (shouldRun) this.run();
    }
    updateAllStateAndData = ({loadingStates, data}, shouldRun = true) => {
        this.updateDataObject(data, false);
        this.updateAllState(loadingStates, false);
        if (shouldRun) this.run();
    }
    updateDataObject = (dataObject, shouldRun = true) => {
        this.dataState = dataObject;
        if (shouldRun) this.run();
    }
    run = () => {
        for (let [key, {listeners, value: loading}] of this.state.entries()) {
            if (!loading) {
                let requestedData = this.dataState?.[key] ?? this.dataState;
                listeners.forEach(([listener, valueFn]) => listener(valueFn(requestedData)));
            }
        }
    }
}
