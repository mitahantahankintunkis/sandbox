import * as Mathutils from "./mathutils.js";


let handle;
const padding = 0;
const maxPathLen = 10;

const colors = [
    "black",
    "white",
    "coral",
    "#55ccdd",
];



export function stop() {
    clearInterval(handle);
}


// Helper functions
function isCornered(maze, x, y) {
    if (x > 1 && maze.matrix[y][x - 2] === 0) return false;
    if (y > 1 && maze.matrix[y - 2][x] === 0) return false;
    if (x < maze.cols * 2 - 1 && maze.matrix[y][x + 2] === 0) return false;
    if (y < maze.rows * 2 - 1 && maze.matrix[y + 2][x] === 0) return false;

    return true;
}


function inBounds(x, y, maze) {
    return x > 0 && x < maze.cols*2 && y > 0 && y < maze.rows*2;
}


export function draw(wallThickness, maze, ctx) {
    let cwidth  = ctx.canvas.width;
    let cheight = ctx.canvas.height;

    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, cwidth, cheight);
    ctx.fillStyle = colors[1];

    let wFloorExact = (cwidth  - wallThickness * (maze.cols + 1) - padding * 2) / maze.cols;
    let hFloorExact = (cheight - wallThickness * (maze.rows + 1) - padding * 2) / maze.rows;
    let wFloor = Math.floor(wFloorExact);
    let hFloor = Math.floor(hFloorExact);
    let padX = padding + wFloorExact * maze.cols - wFloor * maze.cols;
    let padY = padding + hFloorExact * maze.rows - hFloor * maze.rows;
    let curX = Math.round(padX / 2);
    let curY = Math.round(padY / 2);

    maze.matrix[maze.head.y ][maze.head.x] = isCornered(maze, maze.head.x, maze.head.y) ? 3 : 2;
    maze.matrix[maze.end.y  ][maze.end.x] = 2;
    maze.matrix[maze.start.y][maze.start.x] = 2;

    for (let y = 0; y < maze.rows * 2 + 1; ++y) {
        curX = Math.round(padX / 2);
        let h = (y % 2) ? hFloor : wallThickness;

        for (let x = 0; x < maze.cols * 2 + 1; ++x) {
            let w = (x % 2) ? wFloor : wallThickness;
            let colI = maze.matrix[y][x];

            if (colI === 1) {
                ctx.fillRect(curX, curY, w, h);
            } else if (colI !== 0 ){
                ctx.fillStyle = colors[colI];
                ctx.fillRect(curX, curY, w, h);
                ctx.fillStyle = colors[1];
            }

            curX += w;
        }

        curY += h;
    }

    maze.matrix[maze.head.y][maze.head.x] = 1;
}


function gen(maze, stack, ctx) {
    if (stack.length === 0) {
        stop();
        return;
    }

    const stackFrame = stack[stack.length - 1];
    maze.head = {
        x: stackFrame.x,
        y: stackFrame.y,
    };

    const lookup = [
        { x:  0, y:  1 },
        { x:  0, y: -1 },
        { x:  1, y:  0 },
        { x: -1, y:  0 },
    ];

    if (ctx) {
        draw(2, maze, ctx);
    }

    // Shuffling stack
    if (stackFrame.depth >= maxPathLen) {
        Mathutils.shuffle(stack);
        stackFrame.depth = 0;
    }

    // Shuffling directions
    const dirs = [ 0, 1, 2, 3 ];
    Mathutils.shuffle(dirs);

    for (let dir of dirs) {
        if (isCornered(maze, stackFrame.x, stackFrame.y)) {
            stack.pop();
            break;
        }

        const delta   = lookup[dir];
        const wallPos = { x: stackFrame.x + delta.x,   y: stackFrame.y + delta.y   };
        const newPos  = { x: stackFrame.x + delta.x*2, y: stackFrame.y + delta.y*2 };
        
        if (inBounds(newPos.x, newPos.y, maze) && maze.matrix[newPos.y][newPos.x] === 0) {
            maze.matrix[wallPos.y][wallPos.x] = 1;
            maze.matrix[newPos.y ][newPos.x ] = 1;

            stack.push({
                x: newPos.x,
                y: newPos.y,
                depth: stackFrame.depth + 1,
            });
            // Inserting into a random index for better/easier mazes
            //stack.splice(Math.floor(Math.random() * stack.length), 0, newPos);
            break;
        }
    }
}


export function create(rows, cols, ctx) {
    // Simulating stack for easier drawing
    const stack = [ {x: 1, y: 1, depth: 0 } ];

    // Creating a two dimensional array filled with falses
    //let maze = new Array(rows * 2 + 1);
    let maze = {
        rows: rows,
        cols: cols,
        matrix: new Array(rows*2 + 1),
        head:   { x: 1, y: 1 },
        start:  { x: 1, y: 1 },
        end:    { x: cols*2 - 1, y: rows*2 - 1 },
    };

    for (let y = 0; y < maze.rows * 2 + 1; ++y) {
        maze.matrix[y] = new Array(cols * 2 + 1);
        maze.matrix[y].fill(0);
    }

    // Drawing while creating if ctx is supplied
    if (ctx) {
        handle = setInterval(function() {
            gen(maze, stack, ctx);
        }, 16);

        return;
    }

    // Otherwise just creating the maze as fast as possible
    while (stack.length) {
        gen(maze, stack);
    }

    return maze;
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;
}


export function start(ctx) {
    window.addEventListener("resize", function() { resize(ctx); });
    resize(ctx);

    create(40, 80, ctx);
}
