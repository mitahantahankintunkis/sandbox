// Water ripples using cellular automata
let handle;

// Double buffering
let buffer0;
let buffer1;



function reset(ctx) {
    buffer0 = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
    buffer1 = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < buffer0.data.length; i += 4) {
        for (let j = 0; j < 3; ++j) {
            buffer0.data[i + j] = 255;
            buffer1.data[i + j] = 255;
        }
    }
}


// Draws a circle in the current buffer
function circle(x, y, r, ctx) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;

    //let thickness = 10;
    for (let dy = -r; dy <= r; ++dy) {
        for (let dx = -r; dx <= r; ++dx) {
            const ny = y + dy;
            const nx = x + dx;

            if (dy*dy + dx*dx > r*r)  continue;
            //if (dy*dy + dx*dx < (r - thickness)*(r - thickness))  continue;
            if (ny <= 0 || ny >= h - 1) continue;
            if (nx <= 0 || nx >= w - 1) continue;

            buffer1.data[ny*w*4 + nx*4 + 3] = 255;
        }
    }
}


function draw(ctx, mouseState) {
    if (mouseState.inCanvas) {
        circle(Math.floor(mouseState.pos.x), Math.floor(mouseState.pos.y), 40, ctx);
    }
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;

    for (let y = 1; y < h - 1; ++y) {
        for (let x = 1; x < w - 1; ++x) {
            let v = buffer1.data[(y + 1)*w*4 + (x + 0)*4 + 3] +
                    buffer1.data[(y - 1)*w*4 + (x + 0)*4 + 3] +
                    buffer1.data[(y + 0)*w*4 + (x + 1)*4 + 3] +
                    buffer1.data[(y + 0)*w*4 + (x - 1)*4 + 3] +
                    buffer1.data[(y + 1)*w*4 + (x + 1)*4 + 3] +
                    buffer1.data[(y - 1)*w*4 + (x - 1)*4 + 3] +
                    buffer1.data[(y - 1)*w*4 + (x + 1)*4 + 3] +
                    buffer1.data[(y + 1)*w*4 + (x - 1)*4 + 3];
            v /= 4;
            v -= buffer0.data[y*w*4 + x*4 + 3];

            buffer0.data[y*w*4 + x*4 + 3] = v;
        }
    }

    ctx.putImageData(buffer0, 0, 0);

    let temp = buffer0;
    buffer0  = buffer1;
    buffer1  = temp;
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;

    reset(ctx);
}


export function start(ctx, mouseState) {
    window.addEventListener("resize", function() { resize(ctx); });
    resize(ctx);

    handle = setInterval(function() {
        draw(ctx, mouseState);
    }, 33);
}


export function stop() {
    clearInterval(handle);
}
