import * as Maze from "./maze.js";

let handle;


function draw(maze, ctx) {
    Maze.draw(2, maze, ctx);
}


function resize(ctx) {
    let rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width  = rect.width;
    ctx.canvas.height = rect.height;
}


function distance(a, b) {
    return Math.abs(b.x - a.x) + Math.abs(b.y - b.y);
}


function inBounds(x, y, maze) {
    return x > 0 && x < maze.cols*2 && y > 0 && y < maze.rows*2;
}


export function stop() {
    clearInterval(handle);
}


export function start(ctx) {
    window.addEventListener("resize", function() { resize(ctx); });
    resize(ctx);

    //let maze = Maze.create(100, 200);
    let maze = Maze.create(50, 80);

    const stepSize = 15;
    const f = function(node) { return node.toStart + node.toEnd; };
    const nodeHash = function(node) { return node.y*maze.matrix[0].length + node.x; };

    const neighbors = [ { dx:  1, dy:  0 }, { dx: -1, dy:  0 }, { dx:  0, dy:  1 }, { dx:  0, dy: -1 } ];
    const visited = new Set([nodeHash(maze.end)]);
    const unprocessed = [{
        toStart: 0,
        toEnd: distance(maze.start, maze.end),
        x: maze.end.x,
        y: maze.end.y,
        parent: null,
    }];

    let minNode = unprocessed[0];
    let reachedEnd = false;

    const step = function() {
        if (reachedEnd) {
            if (!minNode.parent) return;

            maze.matrix[minNode.y][minNode.x] = 2;

            minNode = minNode.parent;

            draw(maze, ctx);

            return;
        }

        for (let step = 0; step < stepSize; ++step) {
            let minI = 0;
            for (let i = 1; i < unprocessed.length; ++i) {
                if (f(unprocessed[i]) < f(unprocessed[minI])) minI = i;
            }

            minNode = unprocessed[minI];
            unprocessed.splice(minI, 1);
            visited.add(nodeHash(minNode));

            if (nodeHash(minNode) === nodeHash(maze.start)) {
                reachedEnd = true;
                return;
            }

            for (let n of neighbors) {
                let newPos = { x: minNode.x + n.dx, y: minNode.y + n.dy };
                if (!inBounds(newPos.x, newPos.y, maze)) continue;
                if (maze.matrix[newPos.y][newPos.x] === 0 || visited.has(nodeHash(newPos))) continue;

                let newNode = {
                    toStart: minNode.toStart + 1,
                    toEnd: distance(newPos, maze.start),
                    x: newPos.x,
                    y: newPos.y,
                    parent: minNode,
                };

                let unprocessedI = null;
                for (let i = 0; i < unprocessed.length; ++i) {
                    if (nodeHash(unprocessed[i]) === nodeHash(newNode)) {
                        unprocessedI = i;
                        break;
                    }
                }

                if (unprocessedI) {
                    if (f(newNode) < f(unprocessed[unprocessedI])) {
                        unprocessed[unprocessedI].toStart = newNode.toStart;
                        unprocessed[unprocessedI].toEnd   = newNode.toEnd;
                        unprocessed[unprocessedI].parent  = newNode.parent;
                    }
                } else {
                    unprocessed.push(newNode);
                }
            }

            maze.matrix[minNode.y][minNode.x] = 3;
        }

        draw(maze, ctx);
    };

    handle = setInterval(step, 33);
}
