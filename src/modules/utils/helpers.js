export function apostropheFix(value, incoming = true) {
    if( !value ) return value;
    if( incoming ) {
        return value.replace(/'{2,}/g, "'");
    }
    return value.replace(/'/g, "''");
}

export function floatingPointFixForInputs(value, strategy) {
    switch ( strategy ) {
        case 'ceil':
            return Math.ceil(value * 100)
        case 'floor':
            return Math.floor(value * 100)
        case 'trunc':
            return Math.trunc(value * 100)
        default:
            return Math.round(value * 100)
    }
}

export function floatingPointFixForOutputs(value, strategy) {
    return floatingPointFixForInputs(value, strategy) / 100
}

export function conditionalFilter(condition, cb) {
    return condition ? cb : () => true;
}

export function constrain(min, max) {
    return (value) => Math.min(Math.max(value, min), max);
}

export const base26Converter = (num) => {
    let LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    while ( num > 0 ) {
        num--;
        result = LETTERS[num % 26] + result;
        num = Math.floor(num / 26);
    }
    return result;
};

export function setRef(val, ...refs) {
    refs.forEach(ref => {
        if( typeof ref === "function" ) {
            ref(val);
        }
        else if( ref != null ) {
            ref.current = val;
        }
    })
}

export function mergeRefs(...refs) {
    return value => {
        setRef(value, ...refs);
    }
}