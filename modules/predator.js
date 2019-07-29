// "Predator and prey" simulation cellular automata
let handle;

const predatorUpdateSpeed = 32;
const preyUpdateSpeed = 64;
let buffer;
let width;
let height;

const predator = {
    r: 255,
    g: 0,
    b: 0,
};

const prey = {
    r: 15,
    g: 255,
    b: 31,
};

const empty = {
    r: 0,
    g: 0,
    b: 0,
};



function setCell(i, color, alpha) {
    buffer.data[i + 0] = color.r;
    buffer.data[i + 1] = color.g;
    buffer.data[i + 2] = color.b;
    buffer.data[i + 3] = alpha;
}


function cellType(i) {
    let col = {
        r: buffer.data[i + 0],
        g: buffer.data[i + 1],
        b: buffer.data[i + 2],
    };

    if (col.r === predator.r && col.g === predator.g && col.b === predator.b) {
        return "predator";
    }

    if (col.r === prey.r && col.g === prey.g && col.b === prey.b) {
        return "prey";
    }

    return "empty";
}


function neighbor(i, type) {
    let neighbors = [
        i - 4, i + 4, 
        i - width*4, i + width*4,
        i - width*4 - 4, i - width*4 + 4,
        i + width*4 - 4, i + width*4 + 4,
    ];

    for (let n of neighbors) {
        if (n < 0) n += (height - 1)*width*4;
        if (n >= buffer.data.length) n -= (height - 1)*width*4;
        if (cellType(n) === type) {
            return n;
        }
    }
} 


function reset(ctx) {
    buffer = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < buffer.data.length; i += 4) {
        let r = Math.random();

        if (r <= 0.05) {
            setCell(i, predator, Math.floor(Math.random() * 255));
        } else if (r <= 0.5){
            setCell(i, prey, Math.floor(Math.random() * 255));
        } else {
            setCell(i, empty, 255);
        }
    }
}


function draw(ctx) {
    for (let i = 0; i < buffer.data.length; i += 4) {
        switch (cellType(i)) {
            case "predator":
                buffer.data[i + 3] -= predatorUpdateSpeed;

                if (buffer.data[i + 3] <= 0) {
                    setCell(i, empty, 255);
                    break;
                }

                if (buffer.data[i + 3] <= predatorUpdateSpeed * 2) {
                    let n = neighbor(i, "prey");

                    if (n) {
                        buffer.data[i + 3] = 255;
                        setCell(n, predator, Math.floor(Math.random() * 255));
                    }
                }

                break;

            case "prey":
                buffer.data[i + 3] += preyUpdateSpeed;

                if (buffer.data[i + 3] >= 255) {
                    buffer.data[i + 3] = 255;

                    let n = neighbor(i, "empty");

                    if (n) {
                        buffer.data[i + 3] = 1;
                        setCell(n, prey, Math.floor(Math.random() * 255));
                    }
                }

                break;

            case "empty":
                break;
        }
    }

    ctx.putImageData(buffer, 0, 0);
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;
    width  = rect.width;
    height = rect.height;

    reset(ctx);
}


export function start(ctx) {
    window.addEventListener("resize", function() { resize(ctx); });
    resize(ctx);

    handle = setInterval(function() {
        draw(ctx);
    }, 33);
}


export function stop() {
    clearInterval(handle);
}
