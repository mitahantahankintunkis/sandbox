// Generates a snake like structure that follows the mouse
import { Vec2 } from "./mathutils.js";


let handle;
const segments    = 200;
const segmentSize = 10;
const snake       = new Array(segments);


// Represents a single segment of the snake
class Segment {
    constructor(child) {
        this.child = child;
        this.pos   = new Vec2(0, 0);
        this.angle = 0;
    }

    head() {
        return new Vec2(this.pos.x + Math.sin(this.angle) * segmentSize,
                        this.pos.y + Math.cos(this.angle) * segmentSize);
    }

    lookAt(pos) {
        this.angle = Math.atan2(pos.x - this.pos.x, pos.y - this.pos.y);
    }

    moveTowards(pos) {
        this.lookAt(pos);
        this.pos.x = pos.x - (this.head().x - this.pos.x);
        this.pos.y = pos.y - (this.head().y - this.pos.y);
    }

    update(pos) {
        this.moveTowards(pos);

        if (this.child) {
            this.child.update(this.pos);
        }
    }
}


// Updates and draws the snake
function draw(ctx, mouseState) {
    if (mouseState.inCanvas) {
        snake[0].update(mouseState.pos);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "white";

        snake.forEach(function(s) {
            ctx.beginPath();
            ctx.arc(s.pos.x, s.pos.y, segmentSize / 2, 0, Math.PI*2);
            ctx.fill();
        });
    }

    handle = requestAnimationFrame(() => draw(ctx, mouseState));
}


// Recreates the snake and starts the simulation
export function start(ctx, mouseState) {
    snake[segments - 1] = new Segment(null);
    for (let i = segments - 2; i >= 0; --i) {
        snake[i] = new Segment(snake[i + 1]);
    }

    handle = requestAnimationFrame(() => draw(ctx, mouseState));
}


export function stop() {
    cancelAnimationFrame(handle);
}
