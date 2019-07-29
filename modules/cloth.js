// Cloth simulation using verlet integration
import { Vec3 } from "./mathutils.js";


let handle;
const width     = 30;
const height    = 30;
const padding   = 100;
const dampening = 0.999;
const gravity   = 1;
let vertices    = [];
let bones       = [];
let dragged     = null;



// Adds physics to vertices
function updateVertices() {
    for (let v of vertices) {
        if (v.fixed) continue;

        let vel = Vec3.delta(v.oldPos, v.pos);

        vel.scl(dampening);
        v.oldPos.set(v.pos);
        v.pos.add(vel);
        v.pos.y += gravity;
    }
}


// Drags the vertex closest to the mouse
function drag(mouseState) {
    if (!mouseState.inCanvas || !mouseState.down) {
        dragged = null;
        return;
    }

    if (dragged) {
        dragged.pos.x = mouseState.pos.x;
        dragged.pos.y = mouseState.pos.y;
        dragged.oldPos.z -= 1;
        return;
    }

    if (mouseState.inCanvas && mouseState.down) {
        let m = mouseState.pos;
        dragged = vertices.reduce(
            (a, c) => c.pos.asVec2().distSqr(m) < a.pos.asVec2().distSqr(m) ? c : a
        );

        if (dragged.pos.asVec2().distSqr(m) > 2500) {
            dragged = null;
            return;
        }
    }
}


function updateBones() {
    for (let i = 0; i < bones.length; ++i) {
        let b = bones[i];

        // Broken bone
        if (!b) continue;

        let dist  = b.v0.pos.dist(b.v1.pos);
        let delta = b.len - dist;
        let percentage = delta / dist / 2;
        let offset = Vec3.delta(b.v0.pos, b.v1.pos);

        offset.scl(percentage);

        // Breaking bones
        if (dist > b.len * 4 && !b.v0.fixed && !b.v1.fixed) {
            delete bones[i];
            continue;
        }

        if (b.v0.fixed || b.v1.fixed) offset.scl(2);
        if (!b.v0.fixed) b.v0.pos.sub(offset);
        if (!b.v1.fixed) b.v1.pos.add(offset);
    }
}


// Updates the cloth and draws it
function draw(ctx, mouseState) {
    updateVertices();

    for (let i = 0; i < 20; ++i) {
        drag(mouseState);
        updateBones();
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let totalHeight = ctx.canvas.height - padding*2;
    ctx.lineWidth = 1;

    let bonesSorted = bones.slice();
    bonesSorted.sort(function(a, b) {
        return a.v0.pos.z - b.v0.pos.z;
    });

    for (let b of bonesSorted) {
        if (!b) continue;
        let alpha       = ((b.v0.pos.z + totalHeight) / (totalHeight*2)) * 255;
        ctx.strokeStyle = `rgba(${alpha}, ${alpha / 2}, 64, ${alpha / 64})`;

        ctx.beginPath();
        ctx.moveTo(Math.floor(b.v0.pos.x), Math.floor(b.v0.pos.y));
        ctx.lineTo(Math.floor(b.v1.pos.x), Math.floor(b.v1.pos.y));
        ctx.stroke();
    }
}


// Scales the cloth based on the canvas x-axis. Not perfect, but
// works for a couple of small/slow resizes.
export function canvasResized(oldSize, newSize) {
    let sx = newSize.width / oldSize.width;

    for (let vert of vertices) {
        vert.pos.scl(sx);
        vert.oldPos.scl(sx);
    }

    for (let bone of bones) {
        bone.len *= sx;
    }
}


// Deletes the old cloth and generates a new one.
export function start(ctx, mouseState) {
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
            const v0 = vertices[y*width + x];

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
