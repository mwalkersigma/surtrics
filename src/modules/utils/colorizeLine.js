const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
const up = (ctx, value) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined;

export default function colorizeLine (ctx) {
    return up(ctx, 'rgb(0,255,0)') || down(ctx, 'rgb(255,0,0)')
}