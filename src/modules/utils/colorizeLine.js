import {colorScheme} from "../../pages/_app";

const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
const up = (ctx, value) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined;

export default function colorizeLine(options={}) {
    return (ctx) => {
        let defaults = {
            up: 'rgba(0, 255, 0, 0.75)',
            down: 'rgba(255, 0, 0, 0.75)',
            unchanged: colorScheme.blue,
        };
        defaults = {...defaults, ...options};
        return up(ctx, defaults.up) || down(ctx, defaults.down) || defaults.unchanged;
    }
}