import * as Mathutils from "./mathutils.js";


let handle;
const padding        = 0;
const maxPathLen     = 20;
const wallThickness  = 1;
const rows           = 100;
const cols           = 150;
const stepsPerUpdate = 10;

// Storing colors as hexadesimal to avoid string comparisions
export const colors = {
    floor:  0xffffff,
    wall:   0x000000,
    start:  0xff9933,
    end:    0xff9933,
};


export function stop() {
    cancelAnimationFrame(handle);
}


// Helper functions
function isCornered(maze, x, y) {
    if (x > 1 && maze.matrix[y][x - 2] === colors.wall) return false;
    if (y > 1 && maze.matrix[y - 2][x] === colors.wall) return false;
    if (x < maze.cols * 2 - 1 && maze.matrix[y][x + 2] === colors.wall) return false;
    if (y < maze.rows * 2 - 1 && maze.matrix[y + 2][x] === colors.wall) return false;

    return true;
}


function inBounds(x, y, maze) {
    return x > 0 && x < maze.cols*2 && y > 0 && y < maze.rows*2;
}


export function draw(wt, maze, ctx) {
    let cwidth  = ctx.canvas.width;
    let cheight = ctx.canvas.height;

    ctx.fillStyle = Mathutils.hexToCol(colors.wall);
    ctx.fillRect(0, 0, cwidth, cheight);
    ctx.fillStyle = Mathutils.hexToCol(colors.floor);

    let wFloorExact = (cwidth  - wt * (maze.cols + 1) - padding * 2) / maze.cols;
    let hFloorExact = (cheight - wt * (maze.rows + 1) - padding * 2) / maze.rows;
    let wFloor = Math.floor(wFloorExact);
    let hFloor = Math.floor(hFloorExact);
    let padX = padding + wFloorExact * maze.cols - wFloor * maze.cols;
    let padY = padding + hFloorExact * maze.rows - hFloor * maze.rows;
    let curX = Math.round(padX / 2);
    let curY = Math.round(padY / 2);

    for (let y = 0; y < maze.rows * 2 + 1; ++y) {
        curX = Math.round(padX / 2);
        let h = (y % 2) ? hFloor : wt;

        for (let x = 0; x < maze.cols * 2 + 1; ++x) {
            let w = (x % 2) ? wFloor : wt;
            let col = maze.matrix[y][x];

            if (col === colors.floor) {
                ctx.fillRect(curX, curY, w, h);
            } else if (col !== colors.wall){
                ctx.fillStyle = Mathutils.hexToCol(col);
                ctx.fillRect(curX, curY, w, h);
                ctx.fillStyle = Mathutils.hexToCol(colors.floor);
            }

            curX += w;
        }

        curY += h;
    }
}


function moveHead(maze, stack, ctx) {
    for (let step = 0; step < stepsPerUpdate; ++step) {
        if (!stack.length) {
            if (ctx) {
                draw(wallThickness, maze, ctx);
            }

            stop();
            return;
        }

        // Shuffling stack
        if (stack[stack.length - 1].depth >= maxPathLen - 1) {
            Mathutils.shuffle(stack);
            stack[stack.length - 1].depth = 0;
        }

        const deltas = Mathutils.shuffle([ [0, 1], [1, 0], [0, -1], [-1, 0] ]);
        let stackFrame = stack[stack.length - 1];

        // Skipping cells that are cornered
        while (stack.length && isCornered(maze, stackFrame.x, stackFrame.y)) {
            stackFrame = stack.pop();
        }

        for (let delta of deltas) {
            const wallPos = { x: stackFrame.x + delta[0],   y: stackFrame.y + delta[1]   };
            const newPos  = { x: stackFrame.x + delta[0]*2, y: stackFrame.y + delta[1]*2 };
            
            if (inBounds(newPos.x, newPos.y, maze) && maze.matrix[newPos.y][newPos.x] === colors.wall) {
                maze.matrix[wallPos.y][wallPos.x] = colors.floor;
                maze.matrix[newPos.y ][newPos.x ] = colors.floor;

                stack.push({
                    x: newPos.x,
                    y: newPos.y,
                    depth: stackFrame.depth + 1,
                });

                break;
            }
        }
    }

    if (ctx) {
        maze.matrix[maze.end.y  ][maze.end.x  ] = colors.end;
        maze.matrix[maze.start.y][maze.start.x] = colors.start;

        draw(wallThickness, maze, ctx);

        handle = requestAnimationFrame(() => moveHead(maze, stack, ctx));
    }
}


export function create(rows, cols, ctx) {
    // Simulating stack instead of recursion for easier drawing
    const stack = [ { x: 1, y: 1, depth: 0 } ];

    let maze = {
        rows: rows,
        cols: cols,
        matrix: new Array(rows*2 + 1),
        start:  { x: 1, y: 1 },
        end:    { x: cols*2 - 1, y: rows*2 - 1 },
    };

    for (let y = 0; y < maze.rows * 2 + 1; ++y) {
        maze.matrix[y] = new Array(cols * 2 + 1);
        maze.matrix[y].fill(colors.wall);
    }

    // Drawing while creating if ctx is supplied.
    // Otherwise just creating the maze as fast as possible
    if (ctx) {
        handle = requestAnimationFrame(() => moveHead(maze, stack, ctx));
    } else {
        while (stack.length) {
            moveHead(maze, stack);
        }

        return maze;
    }
}



export function start(ctx) {
    create(rows, cols, ctx);
}
