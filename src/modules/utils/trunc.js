export default function trunc(value) {
    if (!value) return null;
    return Math.trunc(value * 100) / 100
}