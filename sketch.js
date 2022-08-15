carScale = 0.3;
var ccar;

var circleTrack;

var wall_grid = [];
var road_grid = [];

var gridSize = 40;

const SIM_WIDTH = 1024;
const SIM_HEIGHT = 1024;

var debugBrain = false;

let STEPS_PER_FRAME = 1;

let mutation_amount = 4;

function testPoint(gridx, gridy){
    let isGood = false;
    if (gridLookup(gridx, gridy) == false) {
        fill(0)
        isGood = false;
    } else {
        fill(200,70,70)
        isGood = true;
    }
    ellipse(gridx, gridy, 10, 10)
    return isGood;
}




// A dict of grids, each representing a grid of data.
// Instantiated on setup().
// const grids = {};

function setup() {
    createCanvas(1000, 1000);
    
    if (debugBrain) {
        frameRate(3);
    }
    
    pixelDensity(1);
    noSmooth();
    
    
    ccar = new Car(200, 200, 0);
    circleTrack =  new Road(SIM_WIDTH, SIM_HEIGHT, RoadType.Gravel);
    
    
    // grids.road = new ValueGrid(SIM_WIDTH, SIM_HEIGHT, 0);
    
    
    for (gx = 0; gx < width / gridSize; gx++) {
        for (gy = 0; gy < height / gridSize; gy++) {
            if (gy == 0) {
                if( road_grid[gx] == undefined){
                    road_grid[gx] = []
                }
                
                if (wall_grid[gx] == undefined) {
                    wall_grid[gx] = [];
                }
                
            } 
            wall_grid[gx][gy] = 0;
            road_grid[gx][gy] = 0;
        }
    }
}

function drawWalls() {
    fill(20);
    for (gx = 0; gx < width / gridSize; gx += 1) {
        for (gy = 0; gy < height / gridSize; gy += 1) {
            if (wall_grid[gx][gy] == 1) {
                rect(gridSize * gx, gridSize * gy, gridSize, gridSize);
            }
        }
    }
}

function gridLookup(px, py) { /// look at the grid and return if wall. 
    
    let gx = int(px / gridSize)
    let gy = int(py / gridSize)
    
    if (gx >= wall_grid.length) {
        return false;
    }
    if (gy >= wall_grid[gx].length) {
        return false;
    }
    return (wall_grid[gx][gy] == 1)
}

function draw() {
    background(240);
    drawWalls();
    
    circleTrack.drawRoad() // circleTrack.drawRoad();
    

    // renderGrid(circleTrack, (index, value) => {
    //     switch (value) {
    //       case RoadType.None:
    //         return color(100, 100, 100);
    //       case RoadType.Gravel:
    //         // Color soil differently depending on moisture.
    //        return color(120, 83, 67);
    //       case RoadType.Road:
    //         return color(56, 56, 561);
    //     //   default:
    //     //     return color(255, 255, 0);
    //     }
    //   });



    // Draw the center of rotation
    // circle(corX,corY, 10)
    fill(200, 100, 100);
    //circle(tcorX,tcorY,10)
    
    if (keyIsDown(UP_ARROW)) {
        ccar.accelerate(1);
    }
    
    if (keyIsDown(DOWN_ARROW)) {
        ccar.reverse(1);
    }
    if (keyIsDown(LEFT_ARROW)) {
        ccar.turnLeft();
    }
    
    if (keyIsDown(RIGHT_ARROW)) {
        ccar.turnRight();
    }
    
    if (keyIsDown(SHIFT)) {
        ccar.break();
    }
    
    ccar.update();
    // ccar.display()
    
    if (gridLookup(mouseX, mouseY) == false) {
        fill(0)
    } else {
        fill(200)
    }
    ellipse(mouseX, mouseY, 20, 20)
    let foundV = circleTrack.findClosestTo(ccar.rearAxle.x,ccar.rearAxle.y);
    // console.log(foundV)
    let closestPoint = foundV[0]
    let trackFraction = foundV[1]
    
    ellipse(closestPoint.x, closestPoint.y, 30,30);
    fill(255);
    text( trackFraction , closestPoint.x, closestPoint.y)
    

    // let targetFraction = (trackFraction + .05)%1
    let targetFraction = mouseX/width;

    let targetPoint =  circleTrack.findPointAtFraction( targetFraction)
    fill(0);
    ellipse(targetPoint.x, targetPoint.y, 30,30);
    fill(255,0,0);
    text( targetFraction, targetPoint.x, targetPoint.y)

    ccar.forwardTarget
 
}

function rectAngle(x, y, w, h, offset, theta) {
    d1 = sqrt((w / 2) * (w / 2) + (h - offset) * (h - offset));
    d2 = sqrt((w / 2) * (w / 2) + offset * offset);
    th1 = atan2(h - offset, w / 2);
    th2 = atan2(offset, w / 2);
    quad(
        x - d1 * cos(th1 - theta),
        y - d1 * sin(th1 - theta),
        x - d2 * cos(th2 + theta),
        y + d2 * sin(th2 + theta),
        x + d2 * cos(th2 - theta),
        y + d2 * sin(th2 - theta),
        x + d1 * cos(th1 + theta),
        y - d1 * sin(th1 + theta)
        );
    }
    
    function sign(x) {
        if (x > 0) {
            return 1;
        } else {
            return -1;
        }
    }
    