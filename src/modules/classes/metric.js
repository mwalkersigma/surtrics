function getValue(input, key) {
    return input[key]
}
export default class Metric {
    constructor(config) {
        this.title = config?.title;
        this.system = config?.system;
        this.systemBadgeName = config?.systemBadgeName;
        this.Explanation = config?.Explanation;
        this.icon = config?.icon;
        this.timeSavings = config?.timeSavings;
        this.value = config?.value;
        this.values = config?.values;
        this.shown = true;
        this.group = config?.group;
        this.isRendered = false;
        this.loadingGroup = config?.loadingGroup;
        this.valueGetter = config?.valueGetter ?? undefined;
        this.dataUrl = config?.dataUrl;
    }

    render = (data) => {

        if (!data) {
            console.log("Rendering Metric: ", this.title)
            console.log("Data: ", data)
            console.log("Values: ", this.values)
            this.value.formula(0)
            this.timeSavings.formula(0)
            this.isRendered = true;
            return;
        }
        if (!this?.values) {
            this.value.formula(0)
            this.timeSavings.formula(0)
            this.isRendered = true;
            return;
        }
        let rawTotal = this.values.reduce((acc, value) => {
            let level;
            value
                .split('.')
                .forEach(key => {
                    level = level ? getValue(level, key) : getValue(data, key)
                })
            return acc + level
        }, 0)
        this.isRendered = true;
        this.value.formula(rawTotal)
        this.timeSavings.formula(rawTotal)
        return this;
    }
}

export class DirectRenderMetric extends Metric {
    constructor(args) {
        super(args);
    }

    render = (val) => {
        this.value.formula(val)
        this.timeSavings.formula(val)
        this.isRendered = true;
    }
}