let handle;


function draw(ctx, mouseState) {
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;
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
