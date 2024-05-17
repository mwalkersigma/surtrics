import {keys} from "@mantine/core";

function filterData(data, search) {
    const query = search.toLowerCase().trim();
    return data.filter((item) => {
        return keys(data[0]).some((key) => `${item[key]}`.toLowerCase().includes(query))
    });
}

export function identifyType(value) {
    if (Number(value) || typeof value === 'number') return "number";
    if (typeof value === 'boolean') return "boolean";
    if (value instanceof Date || new Date(value).toString() !== 'Invalid Date') return "date";
    if (Array.isArray(value)) return "array";
    if (typeof value === 'object') return "object";
    if (typeof value === 'string' && typeof +value !== 'string') return "string";
    return "unknown";
}

function sorter(a, b) {
    let type = identifyType(a);
    switch (type) {
        case "number":
            return a - b;
        case "string":
            return a.localeCompare(b);
        case "date":
            return new Date(a) - new Date(b);
        case "boolean":
            return a - b;
        default:
            return a - b;
    }

}

export default function sortData(data, payload) {
    if (!data) {
        return [];
    }
    const {sortBy} = payload;

    if (!sortBy) {
        return filterData(data, payload.search);
    }

    return filterData([...data].sort((a, b) => {
        if (payload.reversed) {
            return sorter(b[sortBy], a[sortBy]);
        }

        return sorter(a[sortBy], b[sortBy]);
    }), payload.search);
}