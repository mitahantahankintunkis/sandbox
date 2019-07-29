import { Vec2, lerpColor } from "./mathutils.js";


const padding = 100;
const gravity = 2;
const pendulumCount = 36;
let handle;
let startTime;

let pendulums = new Array(pendulumCount);



class Pendulum {
    constructor(length, origin, color) {
        this.color  = color;
        this.length = length;
        this.period = 2*Math.PI * Math.sqrt(this.length / gravity);
        this.origin = origin;
    }

    angle(elapsed) {
        return Math.cos((2*Math.PI / this.period) * elapsed);
    }

    pendulumPos(elapsed) {
        let a = this.angle(elapsed);

        return new Vec2(
            Math.sin(a) * this.length,
            Math.cos(a) * this.length
        );
    }
}


function draw(ctx) {
    let curTime = Date.now();
    let elapsed = (curTime - startTime) / 1000;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "white";

    //console.log(pendulums[0].pendulumPos(10));
    for (let i = 0; i < pendulums.length; ++i) {
        let p = pendulums[i];

        let pos  = p.pendulumPos(elapsed);
        let size = 40 - (pendulums.length - i);

        pos.scl(0.8);
        pos.scl(ctx.canvas.height - padding * 2);
        pos.add(p.origin);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(p.origin.x, p.origin.y);
        ctx.stroke();

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();
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

    startTime = Date.now();

    for (let i = 0; i < pendulumCount; ++i) {
        let alpha = (i + 1) / pendulumCount;
        let k = (45*Math.sqrt(2) / Math.PI) - 2;

        pendulums[pendulumCount - i - 1] = new Pendulum(
            gravity * Math.pow(90 / (2 * Math.PI * (k + i + 2)), 2),
            new Vec2(ctx.canvas.width / 2, padding),
            "#" + lerpColor(0xe02788, 0x1c4ca3, alpha).toString(16)
        );
    }

    handle = setInterval(function() {
        draw(ctx, mouseState);
    }, 33);
}


export function stop() {
    clearInterval(handle);
}

// #e02788
// #f16513
// #3ab0d6
// #1c4ca3
// #180459
