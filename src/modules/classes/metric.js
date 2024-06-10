export default class Metric {
    constructor({title, Explanation, icon, timeSavings, value, values}) {
        this.title = title;
        this.Explanation = Explanation;
        this.icon = icon;
        this.timeSavings = timeSavings;
        this.value = value;
        this.values = values;
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