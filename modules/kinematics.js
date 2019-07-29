//export const name = "kinematics";
import { Vec2 } from "./mathutils.js";


let handle;
const segments    = 75;
const segmentSize = 20;
const snake       = new Array(segments);


class Segment {
    constructor(child) {
        this.child = child;
        this.pos   = new Vec2(0, 0);
        this.angle = 0;
    }

    headX() {
        return this.pos.x + Math.sin(this.angle) * segmentSize;
    }

    headY() {
        return this.pos.y + Math.cos(this.angle) * segmentSize;
    }

    lookAt(x, y) {
        //this.angle = Math.atan2(x - this.x, y - this.y);
        this.angle = Math.atan2(x - this.pos.x, y - this.pos.y);
    }

    moveTowards(x, y) {
        this.lookAt(x, y);
        this.pos.x = x - (this.headX() - this.pos.x);
        this.pos.y = y - (this.headY() - this.pos.y);
    }

    update(x, y) {
        this.lookAt(x, y);
        this.moveTowards(x, y);

        if (this.child) {
            this.child.update(this.pos.x, this.pos.y);
        }
    }
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;
}


function draw(ctx, mouseState) {
    if (mouseState.inCanvas) {
        snake[0].update(mouseState.pos.x, mouseState.pos.y);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.strokeStyle = "white";
        ctx.lineWidth = "5";
        ctx.beginPath();
        ctx.moveTo(snake[0].headX(), snake[0].headY());

        for (let s of snake) {
            ctx.lineTo(s.pos.x, s.pos.y);
        }

        ctx.stroke();
    }
}


export function start(ctx, mouseState) {
    window.addEventListener("resize", function() { resize(ctx); });
    resize(ctx);

    // Initializing
    snake[segments - 1] = new Segment(null);
    for (let i = segments - 2; i >= 0; --i) {
        snake[i] = new Segment(snake[i + 1]);
    }

    handle = setInterval(function() {
        draw(ctx, mouseState);
    }, 33);
}


export function stop() {
    clearInterval(handle);
}
