import { Vec2 } from './mathutils.js';


let handle;
let speed    = 3;
let padding  = 100;
let vecCount = 40;

class Point {
    constructor(ctx) {
        this.pos = new Vec2(
            Math.random() * (ctx.canvas.width  + padding),
            Math.random() * (ctx.canvas.height + padding)
        );
        this.vel = new Vec2(
            Math.random() * speed - speed / 2,
            Math.random() * speed - speed / 2
        );
    }
}

const vectors = [];


function awayFromMouse(vec, mouseState) {
    let delta = Vec2.delta(mouseState.pos, vec.pos);

    let acc = new Vec2(5e2 / delta.lenSqr(), 5e2 / delta.lenSqr());

    acc.mul(acc);
    acc.mul(delta);

    vec.vel.add(acc);

    if (vec.vel.lenSqr() > speed*speed) {
        vec.vel.nor();
    }
}


function draw(ctx, mouseState) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = "2";

    // Update
    for (let i = 0; i < vectors.length; ++i) {
        let vec = vectors[i];

        vec.pos.add(vec.vel);

        if (mouseState.inCanvas) {
            awayFromMouse(vec, mouseState);
        }

        // Wrapping
        if (vec.pos.x < -padding) vec.pos.x = w + padding;
        if (vec.pos.y < -padding) vec.pos.y = h + padding;
        if (vec.pos.x > w + padding) vec.pos.x = -padding;
        if (vec.pos.y > h + padding) vec.pos.y = -padding;

        // Lines
        for (let j = i + 1; j < vectors.length; ++j) {
            if (j === i) continue;
            let vec2 = vectors[j];

            let dx = vec2.pos.x - vec.pos.x;
            let dy = vec2.pos.y - vec.pos.y;

            let distSqr = (dx*dx) + (dy*dy);
            let col = Math.min(4e3 / distSqr, 255);

            ctx.strokeStyle = `rgba(0, 255, 64, ${col})`;

            ctx.beginPath();
            ctx.moveTo(vec .pos.x, vec .pos.y);
            ctx.lineTo(vec2.pos.x, vec2.pos.y);
            ctx.stroke();
        }
    }
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;
}


export function start(ctx, mouseState) {
    window.addEventListener("resize", function() {
        resize(ctx);
    });
    resize(ctx);

    for (let i = 0; i < vecCount; ++i) {
        vectors[i] = new Point(ctx);
    }

    handle = setInterval(function() {
        draw(ctx, mouseState);
    }, 33);
}

export function stop() {
    clearInterval(handle);
}
