// Cloth simulation using verlet integration
import { Vec2, Vec3 } from "./mathutils.js";


let handle;
const width     = 30;
const height    = 30;
const padding   = 100;
const dampening = 0.999;
const gravity   = 1;
let vertices    = [];
let bones       = [];
let dragged     = null;



function updateVertices(mouseState) {
    for (let v of vertices) {
        if (v.fixed) continue;

        let vel = Vec3.delta(v.oldPos, v.pos);

        vel.scl(dampening);
        v.oldPos.set(v.pos);
        v.pos.add(vel);
        v.pos.y += gravity;
    }

    // Mouse
    if (!mouseState.inCanvas || !mouseState.down) {
        dragged = null;
    }

    if (!dragged && mouseState.inCanvas && mouseState.down) {
        dragged = vertices[0];
        let closestPos = new Vec2(dragged.pos.x, dragged.pos.y);

        for (let v of vertices) {
            let curPos = new Vec2(v.pos.x, v.pos.y);

            if (curPos.distSqr(mouseState.pos) < closestPos.distSqr(mouseState.pos)) {
                dragged = v;
                closestPos = curPos;
            }
        }

        if (closestPos.distSqr(mouseState.pos) > 2500) {
            dragged = null;
        }
    }
}

function updateBones(mouseState) {
    if (dragged) {
        dragged.pos.x = mouseState.pos.x;
        dragged.pos.y = mouseState.pos.y;
        dragged.oldPos.z -= 1;
    }

    for (let i = 0; i < bones.length; ++i) {
        let b = bones[i];

        // Broken bone
        if (!b) continue;

        let dist  = b.v0.pos.dist(b.v1.pos);
        let delta = b.len - dist;

        // Breaking bones
        if (dist > bones[i].len * 4 && !bones[i].v0.fixed && !bones[i].v1.fixed) {
            delete bones[i];
            continue;
        }

        let percentage = delta / dist / 2;

        if (b.v0.fixed || b.v1.fixed) {
            percentage *= 2;
        }

        let offsetX = (b.v1.pos.x - b.v0.pos.x) * percentage;
        let offsetY = (b.v1.pos.y - b.v0.pos.y) * percentage;
        let offsetZ = (b.v1.pos.z - b.v0.pos.z) * percentage;

        if (!b.v0.fixed) {
            b.v0.pos.x -= offsetX;
            b.v0.pos.y -= offsetY;
            b.v0.pos.z -= offsetZ;
        }
        if (!b.v1.fixed) {
            b.v1.pos.x += offsetX;
            b.v1.pos.y += offsetY;
            b.v1.pos.z += offsetZ;
        }
    }
}


function draw(ctx, mouseState) {
    updateVertices(mouseState);
    for (let i = 0; i < 20; ++i) updateBones(mouseState);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let totalHeight = ctx.canvas.height - padding*2;

    for (let v of vertices) {
        let alpha     = ((v.pos.z + totalHeight) / (totalHeight*2)) * 255;
        ctx.fillStyle = `rgba(${alpha}, ${alpha / 2}, 64, 255)`;

        ctx.beginPath();
        ctx.arc(v.pos.x, v.pos.y, 2, 0, Math.PI*2);
        ctx.fill();
    }

    for (let b of bones) {
        if (!b) continue;
        let alpha       = ((b.v0.pos.z + totalHeight) / (totalHeight*2)) * 255;
        ctx.strokeStyle = `rgba(${alpha}, ${alpha / 2}, 64, 255)`;

        ctx.beginPath();
        ctx.moveTo(b.v0.pos.x, b.v0.pos.y);
        ctx.lineTo(b.v1.pos.x, b.v1.pos.y);
        ctx.stroke();
    }
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;
}


export function start(ctx, mouseState) {
    window.addEventListener("resize", function() { resize(ctx); });
    resize(ctx);

    vertices = [];
    bones    = [];

    // Vertices
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const nx = padding + x * ((ctx.canvas.width  - padding*2) / width);
            const ny = padding + y * ((ctx.canvas.height - padding*2) / height);

            vertices.push({
                pos:    new Vec3(nx, padding, ny),
                oldPos: new Vec3(nx, padding, ny),
                fixed:  (x === 0 && y === 0) || (x === width - 1 && y === 0),
            });
        }
    }

    // Bones
    let deltas = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const v0 = vertices[(y + 0)*width + (x + 0)];

            for (let d of deltas) {
                if (x + d[0] >= width || y + d[1] >= height) continue;
                if (x + d[0] < 0 || y + d[1] < 0) continue;

                let v1 = vertices[(y + d[1])*width + (x + d[0])];
                bones.push({ v0: v0, v1: v1, len: v0.pos.dist(v1.pos) });
            }
        }
    }

    handle = setInterval(function() {
        draw(ctx, mouseState);
    }, 33);
}


export function stop() {
    clearInterval(handle);
}
