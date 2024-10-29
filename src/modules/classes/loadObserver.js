import Metric, {DirectRenderMetric} from "./metric";
import {localMetric} from "../metrics/consts";

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
        if (metric instanceof Metric || metric instanceof DirectRenderMetric) {
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
