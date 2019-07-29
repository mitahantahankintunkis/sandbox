// Water ripples using cellular automata
let handle;

// Double buffering
let buffer0;
let buffer1;

let scale = 4;
let width;
let height;



function reset(ctx) {
    buffer0 = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
    buffer1 = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < buffer0.data.length; i += 4) {
        for (let j = 0; j < 3; ++j) {
            buffer0.data[i + j] = 255;
            buffer1.data[i + j] = 255;
        }

        let r = Math.floor(Math.random() * 2) * 255;

        buffer0.data[i + 3] = r;
        buffer1.data[i + 3] = r;
    }
}


function neighbors(x, y) {
    let ret = 0;

    for (let dx = -1; dx <= 1; ++dx) {
        for (let dy = -1; dy <= 1; ++dy) {
            if (dx === 0 && dy === 0) continue;
            let nx = x + dx;
            let ny = y + dy;

            // Wrapping
            if (nx < 0) nx = width  - 1;
            if (ny < 0) ny = height - 1;
            if (nx >= width)  nx = 0;
            if (ny >= height) ny = 0;

            if (buffer1.data[ny*width*4 + nx*4 + 3] === 255) {
                ret += 1;
            }
        }
    }

    return ret;
}


function draw(ctx, mouseState) {
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            let n = neighbors(x, y);
            if (buffer1.data[y*width*4 + x*4 + 3] === 255) {
                if (n === 2 || n === 3) continue;
                if (n < 2 || n > 3) buffer0.data[y*width*4 + x*4 + 3] = 0;
            } else if (n === 3) {
                buffer0.data[y*width*4 + x*4 + 3] = 255;
            }
        }
    }

    if (mouseState.inCanvas && mouseState.down) {
        let x = Math.floor(mouseState.pos.x / scale);
        let y = Math.floor(mouseState.pos.y / scale);

        buffer0.data[y*width*4 + x*4 + 3] = 255;
    }

    ctx.putImageData(buffer0, 0, 0);

    for (let i = 0; i < buffer0.data.length; ++i) {
        buffer1.data[i] = buffer0.data[i];
    }
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width  / scale;
    ctx.canvas.height = rect.height / scale;

    width  = ctx.canvas.width;
    height = ctx.canvas.height;

    ctx.imageSmoothingEnabled       = false; // standard 
    ctx.mozImageSmoothingEnabled    = false; // Firefox 
    ctx.oImageSmoothingEnabled      = false; // Opera 
    ctx.webkitImageSmoothingEnabled = false; // Safari 
    ctx.msImageSmoothingEnabled     = false; // IE

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
