export default class Metric {
    constructor({title, Explanation, icon, timeSavings, value, values, system, systemBadgeName, group = undefined}) {
        this.title = title;
        this.system = system;
        this.systemBadgeName = systemBadgeName;
        this.Explanation = Explanation;
        this.icon = icon;
        this.timeSavings = timeSavings;
        this.value = value;
        this.values = values;
        this.shown = true;
        this.group = group;
    }

    render(data) {
        if (!this?.values) {
            this.value.formula(0)
            this.timeSavings.formula(0)
            return;
        }
        let rawTotal = this.values.reduce((acc, value) => {
            function getValue(input, key) {
                return input[key]
            }

            let level;

            value
                .split('.')
                .forEach(key => {
                    level = level ? getValue(level, key) : getValue(data, key)
                })

            return acc + level
        }, 0)
        this.value.formula(rawTotal)
        this.timeSavings.formula(rawTotal)
        return this;
    }
}

export class DirectRenderMetric extends Metric {
    constructor(args) {
        super(args);
    }

    render(val) {
        this.value.formula(val)
        this.timeSavings.formula(val)
    }
}