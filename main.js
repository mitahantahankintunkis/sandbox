import * as Kinematics  from "./modules/kinematics.js";
import * as Cloth       from "./modules/cloth.js";
import * as Vectorfield from "./modules/vectorfield.js";
import * as Pendulum    from "./modules/pendulum.js";
import * as Ripple      from "./modules/ripple.js";
import * as Predator    from "./modules/predator.js";
import * as GameOfLife  from "./modules/gameoflife.js";
import * as Maze        from "./modules/maze.js";
import * as AStar       from "./modules/astar.js";

import { Vec2 } from "./modules/mathutils.js";

// TODO - dynamic module loading
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Mouse coordinates
let mouseState = {
    down:     false,
    inCanvas: false,
    pos:       new Vec2(0, 0),
};


// Contains functions that return a handle to an interval.
// These intervals update the canvas in some way
let hashes = {
    "#ripple":      Ripple,
    "#vectorfield": Vectorfield,
    "#cloth":       Cloth,
    "#kinematics":  Kinematics,
    "#pendulums":   Pendulum,
    "#predators":   Predator,
    "#gameoflife":  GameOfLife,
    "#maze":        Maze,
    "#a*":          AStar,
};

// Current program from the modules above
let curProgram;



function hashChange() {
    let hash = window.location.hash.toLowerCase();

    if (curProgram) {
        curProgram.stop();
    }

    if (hashes.hasOwnProperty(hash)) {
        $("canvas").show();
        $(".about").hide();

        curProgram = hashes[hash];
        curProgram.start(ctx, mouseState);
    } else {
        $("canvas").hide();
        $(".about").show();
    }
}

window.onhashchange = hashChange;
window.onload       = hashChange;

canvas.addEventListener("mousemove", function(event) {
    let rect = canvas.getBoundingClientRect();

    mouseState.pos.x = event.clientX - rect.left;
    mouseState.pos.y = event.clientY - rect.top;
});

canvas.addEventListener("mouseover", function() {
    mouseState.inCanvas = true;
});

canvas.addEventListener("mouseout", function() {
    mouseState.inCanvas = false;
});

document.addEventListener("mousedown", function(event) {
    if (event.which === 1) {
        mouseState.down = true;
    }
});

document.addEventListener("mouseup", function(event) {
    if (event.which === 1) {
        mouseState.down = false;
    }
});
