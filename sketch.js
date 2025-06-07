// a simple genetic algorithm, Evolving agents to drive cars around a track
// the car that drives the furthest around the track is the most fit
// we will be using p5js for the graphics

let debugBrain = false;


let STEPS_PER_FRAME = 1;

let mutation_amount = 30;

let fitnessRange = [0, 0];

var FieldSize = [300, 300];

var totalAgents = 500;

var WinnningCars = [];
var topWinners = 50;
var TopAgents = [];
var numberOfTopAgents = 100;

var stepsPerFrame = 10;
var currentStep = 0;

let myFont;

// let FieldID;

let athTeam = [];

var carScale = 0.3;
// var singleCarMode = true;
var carArray = [];
var numberOfCars = 10;
var gasFillup = 900;


var circleTrack;

var wall_grid = [];
var road_grid = [];

var gridSize = 40;

var AgentsList = [];



var scoreBoard;
scoreBoardVisible = false;
var scoreCount = 0;

// Colors used to visualize various parameters
var colorLow;
var colorHigh;


const SIM_WIDTH = 1024;
const SIM_HEIGHT = 1024;

function makeRandomID() {
    // this function will make a 10 charactor ID that has characters from 0-9 and a-z
    let id = "";
    let possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 10; i++) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return id;
}

function preload() {
    // myFont = loadFont('assets/DIN-Black.otf');
    // make Blocks array
    ResetField();
}
function ResetField() {

    AgentsList = [];
}

function PickRandomAgent() {

    // this algorithm will pick agents that have a higher fitness more often
    /// we first normalize all fitness values to be between 0 and 1 from the TopAgents list
    // then we can pick a random number between 0 and 1 as our threshold
    // if the fitness is higher than the threshold, we pick that agent
    // if not, we pick a new random number and try again in a loop

    let randVal = random(0, 1); // a value to limit our random pick

    let foundOne = false;

    let topFitness = TopAgents[0].Fitness;
    let bottomFitness = TopAgents[TopAgents.length - 1].Fitness;

    let loopCount = 0;

    while (!foundOne) {
        loopCount++;
        if (loopCount > 1000) {
            console.log("loopCount exceeded 1000");
            return TopAgents[0];
        }
        let randIndex = int(random(TopAgents.length));
        let randAgent = TopAgents[randIndex];
        let randAFitness = map(randAgent.Fitness, bottomFitness, topFitness, 0, 1);
        if (randAFitness > randVal) {
            foundOne = true;
            return randAgent;
        }
    }

}

// Make a new random gene sequence from scratch.
function makeRandomGeneSequence() {
    let genome = []
    numberOfGenes = int(random(6, 20));
    for (let b = 0; b < numberOfGenes; b++) {
        let digit = random(0, 4294967295);
        genome.push(hex(digit, 8).replace('.', '0'));
    }
    return genome
}

function hex2bin(hex) {
    let val = parseInt(hex, 16);
    let binStr = val.toString(2);
    while (binStr.length < 32) {
        binStr = "0" + binStr;
    }
    return binStr;
}

function int2hex(bin) {
    return bin.toString(16);
}


// Returns a copy of geneIn with one modified synapse.
function mutateGeneSequence(geneIn) {
    const geneOut = geneIn.slice();
    numGenomes = geneIn.length;
    let randomRun = round(random(numGenomes));
    // adjust a random number of genes.
    for (let index = 0; index < randomRun; index++) {
        let randPick = int(random(geneIn.length));
        let digit = random(0, 4294967295);
        let newHex = hex(digit, 8).replace('.', '0')
        geneOut[randPick] = newHex;
    }
    return geneOut;
}

var AgentsList = [];


// var socket = io.connect('http://localhost:5500', { reconnect: true });

// // Add a connect listener
// socket.on('connect', function (socket) {
//     console.log('Connected!');
// });

// // Add a connect listener
// socket.on('disconnect', function (socket) {
//     console.log('Disconnected!');
// });

let dnaPick = 0;

function setup() {
    dnaPick = int(15, random(athTeam.length))
    // FieldID = makeRandomID();
    createCanvas(windowWidth , windowHeight);
    colorLow = color(218, 100, 100);
    colorHigh = color(30, 200, 120);
    circleTrack = new Road(SIM_WIDTH, SIM_HEIGHT, RoadType.Gravel);

    document.oncontextmenu = function () { return false; }

    // add agents from storeage if there are any
    var storedList = localStorage.getItem("TopAgents");

    if (storedList != null) {
        dnaList = JSON.parse(storedList);
        for (let i = 0; i < dnaList.length; i++) {
            let DNANow = dnaList[i].split(',')
            console.log(DNANow);
            athTeam.push(DNANow);
        }
    }
}

function addWinner(GSEQin, distanceRecord) {

    for (let index = 0; index < WinnningCars.length; index++) {
        const carPick = WinnningCars[index];
        if (carPick["GSEQ"] == GSEQin) {
            if (WinnningCars[index]["dist"] < distanceRecord) {
                WinnningCars[index]["dist"] = distanceRecord;
            }

            return
        }
    }

    WinnningCars.push({ "GSEQ": GSEQin, "dist": distanceRecord });
}

function sign(x) {
    if (x > 0) {
        return 1;
    } else {
        return -1;
    }
}

var runCount = 0;
function draw() {


    runCount++;
    background(0, 10);
    noFill();
    stroke(255);

    background(240);

    circleTrack.drawRoad() // circleTrack.drawRoad();



    if (AgentsList.length < totalAgents) {
        let needAmmt = totalAgents - AgentsList.length;
        for (let i = 0; i < int(needAmmt / 80); i++) {
            if (TopAgents.length > 1 && random(1) < TopAgents.length / 100) {
                let dna = PickRandomAgent().DNA;
                AgentsList.push(new Agent(dna));

                dna = mutateGeneSequence(dna);
                AgentsList.push(new Agent(dna));
            }
            else {
                let dna = makeRandomGeneSequence();
                let agent = new Agent(dna);
                // console.log("new agent");
                AgentsList.push(agent);
            }
        }
    }


  
        sortWinners();

        if (fitnessRange[1] > .71) {
            repopulate();
        }

        for (let stepidx = 0; stepidx < STEPS_PER_FRAME; stepidx++) {
            currentStep += 1;
            // if (currentStep > stepsPerRound) {
            //     currentStep = 0;
            //     console.log("END OF ROUND")
            //     // repopulate();
            //     circleTrack = new Road(SIM_WIDTH, SIM_HEIGHT, RoadType.Gravel);

            // }
            for (let cidx = carArray.length - 1; cidx >= 0; cidx--) { // backwards loop
                if (carArray[cidx].Gasoline <= 0) {
                    carArray.splice(cidx, 1)
                }
            }


            for (let cidx = 0; cidx < carArray.length; cidx++) {
                let carN = carArray[cidx];
                carN.runBrain();
                carN.update(cidx);
            }

        }

        for (let cidx = 0; cidx < carArray.length; cidx++) {
            let carN = carArray[cidx];
            // if (darkMode) {
            //     fill(carN.carColor + '12')
            //     noStroke();
            //     ellipse(carN.rearAxle.x, carN.rearAxle.y, 1, 1)
            // } else {
                carN.drawCar();
            // }
        }


        if (carArray.length < numberOfCars) {

            let topFitness = 0;
            let winners = [];

            for (let cidx = 0; cidx < carArray.length; cidx++) {
                let carN = carArray[cidx];
                if (carN.lastCheckpoint > topFitness) {
                    topFitness = carN.lastCheckpoint;
                }
            }

            // above just finds the top most checkpoint reached

            for (let cidx = 0; cidx < carArray.length; cidx++) {
                let carN = carArray[cidx];
                if (carN.lastCheckpoint == topFitness) {


                }
                /// avove adds all cars who made it to this top checkpoint to an array
            }
            while (carArray.length < numberOfCars) {
                let GSEQ = makeRandomGeneSequence();
                if (fitnessRange[1] < .2) {
                    let carN = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
                    carArray.push(carN);
                }
                if (WinnningCars.length > 0 && random() > .1) {
                    GSEQ = WinnningCars[int(random(WinnningCars.length))]["GSEQ"];
                    if (random() > .1) {
                        GSEQ = mutateGeneSequence(GSEQ)
                    }
                    let carN = new Car(circleTrack.startingLine.x, circleTrack.startingLine.y, circleTrack.startDir, GSEQ);
                }
            }
        }
    

    // for (let i = AgentsList.length - 1; i > 0; i--) {
    //     AgentsList[i].update();
    //     // if (AgentsList[i].pos.y > highestY) {
    //     //     highestY = AgentsList[i].pos.y;
    //     // }
    //     if (AgentsList[i].age > MAX_AGE) {
    //         // agentFitness = int(AgentsList[i].fitness);
    //         numFoods = AgentsList[i].foodEaten.length;
    //         agentPosition = AgentsList[i].pos;
    //         // // loop through all the food spots and find the closest one
    //         // let closestFood = FieldSize;
    //         // for (let j = 0; j < FoodSpots.length; j++) {
    //         //     let foodPos = FoodSpots[j].pos;
    //         //     let dist = p5.Vector.dist(agentPosition, foodPos);
    //         //     if (dist < closestFood) {
    //         //         closestFood = dist;
    //         //     }
    //         // }

    //         // let closeAward = (FieldSize - closestFood) / FieldSize;
    //         // agentMovement = AgentsList[i].totalMovement;
    //         // agentFitness = agentFitness + (agentMovement / 1000) + closeAward;
    //         let agentDepth = pow(PosToBlock(AgentsList[i].pos)[1], 2); // how deep the agent is
    //         let agentAgentFoods = AgentsList[i].foodEaten.length; // how many foods the agent ate
    //         let agentFit = AgentsList[i].fitness / 100; // this is food and ground eaten
    //         let agentMovement = AgentsList[i].totalMovement / 1000; // how far the agent moved
    //         // agent devination should be the x z distance from zero
    //         let agentDeviation = dist(AgentsList[i].pos.x, AgentsList[i].pos.z, 0, 0) / FieldSize[0] / 2; // how far the agent moved from the center
    //         // would like the deviation to reward closeness to the center
    //         agentDeviation = 1 - agentDeviation;
    //         // agentFitness = (AgentsList[i].pos.y + FieldSize[1] / 2)
    //         agentFitness = agentDepth + agentFit + agentMovement + agentDeviation;
    //         agentFitness = pow(agentFitness, 2)
    //         // if (agentMovement < 600) {
    //         //     agentFitness = 0;
    //         // }
    //         // agentFitness = agentFitness + (numFoods * 10); // multiply the fitness by the number of foods eaten as a bonus
    //         // top value of all time is :
    //         if (TopAgents.length > 0) {
    //             let topFitness = TopAgents[0].Fitness;
    //             if (agentFitness > topFitness) {
    //                 console.log("New top fitness: " + agentFitness);
    //                 console.log("Agent had " + agentFit + " fitness and " + agentMovement + " movement and " + agentDeviation + " deviation and " + agentDepth + " depth and " + agentAgentFoods + " agent foods")
    //                 // get the history of the agent and convert the PVectors to arrays
    //                 let historyPV = AgentsList[i].Ppos;
    //                 let historyArry = [];
    //                 for (let j = 0; j < historyPV.length; j++) {
    //                     historyArry[j] = [historyPV[j].x, historyPV[j].y, historyPV[j].z];
    //                 }
    //                 // 
    //                 if (AgentsList[i].totalMovement > 1 && agentFitness > 0 && AgentsList[i].pos.y > (-FieldSize[1] / 2) + 30) {
    //                     var data = {
    //                         id: AgentsList[i].ID,
    //                         historyPos: historyArry,
    //                         age: AgentsList[i].age,
    //                         fitness: agentFitness,
    //                         colorR: AgentsList[i].colorR,
    //                         colorG: AgentsList[i].colorG,
    //                         colorB: AgentsList[i].colorB,
    //                         dna: AgentsList[i].dna,
    //                         agentStart: AgentsList[i].startTime,
    //                         FieldID: FieldID,
    //                         type: "agent"
    //                     }
    //                     // send the data to the server in a socket message called "agentDeath"
    //                     socket.emit('agentDeath', data);
    //                 }
    //             }
    //         }
    //         if (agentFitness > 0) {
    //             // console.log("Agent died, had " + numFoods + " foods and " + agentMovement + " movement")
    //             // make sure this dna is not already in the list
    //             let dna = AgentsList[i].dna
    //             let dnaStr = dna.join(',');
    //             let dnaFound = false;
    //             for (let j = 0; j < TopAgents.length; j++) {
    //                 if (dnaStr == TopAgents[j].DNA.join(',')) {
    //                     dnaFound = true;
    //                     // if the fitness of the dna in the list is less than the current fitness, replace it
    //                     if (TopAgents[j].Fitness < agentFitness) {
    //                         TopAgents[j].Fitness = agentFitness;
    //                     }
    //                 }
    //             }
    //             if (!dnaFound) { // if the dna is not already in the list, add it
    //                 TopAgents.push({ "DNA": AgentsList[i].dna, "Fitness": agentFitness });
    //             }
    //             else {
    //                 // console.log("dna already in list");
    //                 // update the fitness of the dna in the list
    //             }
    //         }
    //         // when the agent has died, send the data to the server
    //         // // send a websocket message with the agents position and ID to the server in JSON format
    //         AgentsList.splice(i, 1);
    //     }
    // }

    for (let i = AgentsList.length - 1; i >= 0; i--) {
        // we can improve performance by only showing the agents that have moved a certain distance from the y start position
        // the y start is the half the FieldSize[1] (the height of the field)
        // if (AgentsList[i].pos.y > (-FieldSize[1] / 2) + 30) {
            AgentsList[i].show();
        // }
        // AgentsList[i].show();
    }
    // sort top agents by fitness
    TopAgents.sort(function (a, b) {
        return b.Fitness - a.Fitness;
    }
    );

    // if there are more than 100 top agents, remove the lowest fitness ones
    if (TopAgents.length > numberOfTopAgents) {
        TopAgents.splice(numberOfTopAgents, TopAgents.length - numberOfTopAgents);
    }

    // // add agents to the ul list "AgentList"
    // let list = document.getElementById("AgentList");
    // list.innerHTML = "";
    // for (let i = 0; i < TopAgents.length; i++) {
    //     let li = document.createElement("li");
    //     li.appendChild(document.createTextNode("DNA " + i + ": " + TopAgents[i].DNA[0] + " Fitness: " + TopAgents[i].Fitness));
    //     list.appendChild(li);
    // }

}


function sortWinners() {

    WinnningCars.sort((a, b) => {
        return b.dist - a.dist;
    });

    while (WinnningCars.length > topWinners) {
        WinnningCars.pop();
    }
    fill(0);
    // console.log(WinnningCars.length)
    // for (let index = 0; index < WinnningCars.length; index++) {
    //     const carPick = WinnningCars[index];
    //     // console.log(index, carPick)
    //     if (!darkMode) {
    //         if (carPick["dist"] <= .7) {
    //             fill(200, 0, 0);
    //         }
    //         // text(index + ' : ' + (carPick["dist"]).toFixed(2) + ' : ' + carPick["GSEQ"], 10, 100 + index * 15)
    //     }

    // }
    // console.log('---')

    let scoreSteps = 10000;

    if (WinnningCars.length > 2) {
        scoreCount++;
        // console.log(WinnningCars[0])
        fitnessRange = [WinnningCars[0]["dist"], WinnningCars[min(WinnningCars.length - 1, topWinners - 1)]["dist"]]
        if (scoreCount >= scoreSteps) {
            // scoreBoard.background(0);
            scoreCount = 0;
        }
        let x = map(scoreCount, 0, scoreSteps, 0, width)
        let f1 = map(fitnessRange[0], 0, 1, 0, 200)
        let f2 = map(fitnessRange[1], 0, 1, 0, 200)

        // scoreBoard.stroke(255);
        // scoreBoard.point(x, f1);
        // scoreBoard.point(x, f2);


    }

    // var winnerListString = '';
    // for (var i = 0; i < WinnningCars; i++) {
    //     winnerListString += i + ' : ' + WinnningCars[i].score + '<br>';
    // }

    // winnerDiv.html(winnerListString);
}

function saveTopAgent() {
    let data = TopAgents[0].DNA.join(',');
    // get current stored list and add new agent to it
    // save in local storage
    let storedList = localStorage.getItem("TopAgents");
    storedList = JSON.parse(storedList);
    if (storedList == null) {
        storedList = [];
    }
    // add new agent to list
    storedList.push(data);
    let jdata = JSON.stringify(storedList);
    localStorage.setItem("TopAgents", jdata);
}


class Agent {
    constructor(dnaIn) {
        // constructor contains the agents properties including position, fitness, and dna
        this.pos = createVector(random(-10, 10), FieldSize[1] / -2, 0);
        this.IntPos = createVector(0, 0, 0);
        this.fitness = 0;
        this.dna = dnaIn;
        this.InternalNeurons = [0, 0, 0];
        this.brains = [];
        this.age = 0;
        this.energy = 100;
        this.totalMovement = 0;
        this.startTime = runCount;

        this.ID = makeRandomID();
        this.foodEaten = []; // put the food id's of the food eaten in this array

        // color is the first three genes of the DNA sequence converted to RGB
        this.colorR = parseInt(hex2bin(this.dna[0]).substring(0, 8), 2);
        this.colorG = parseInt(hex2bin(this.dna[0]).substring(8, 16), 2);
        this.colorB = parseInt(hex2bin(this.dna[0]).substring(16, 24), 2);

        // console.log(this.colorR + " " + this.colorG + " " + this.colorB);
        // console.log("dna: " + this.dna);

        this.Ppos = [];

        for (var intI = 0; intI < this.dna.length; intI++) {
            let synapse = new ABrain(this.dna[intI]);
            this.brains.push(synapse);
        }
    }

    moveAgent(mx, my, mz) {
        // check to see if the desired relative movement will put the agent outside of the field or inside of a Block
        // if it will, do not move the agent
        // otherwise update the agents position

        let nextX = this.pos.x + mx;
        let nextY = this.pos.y + my;
        let nextZ = this.pos.z + mz;


        if (nextX > FieldSize[0] / 2 || nextX < FieldSize[0] / -2) {
            mx = 0;
        }
        if (nextY + my > FieldSize[1] / 2 || nextY + my < FieldSize[1] / -2) {
            my = 0;
        }
        if (nextZ + mz > FieldSize[2] / 2 || nextZ + mz < FieldSize[2] / -2) {
            mz = 0;
        }


        // check to see if the agent is inside of a block
        let insideBlock = false;

        let blockNLoc = PosToBlock(createVector(nextX, nextY, nextZ));

        let blockX = blockNLoc[0];
        let blockY = blockNLoc[1];
        let blockZ = blockNLoc[2];


        // check if the block postion is inside the field
        if (blockX >= 0 && blockX < Blocks.length && blockY >= 0 && blockY < Blocks[0].length && blockZ >= 0 && blockZ < Blocks[0][0].length) {
            /// check the block at position blockX blockY blockZ see if the value is greater then 1
            if (Blocks[blockX] != undefined && Blocks[blockX][blockY] != undefined && Blocks[blockX][blockY][blockZ] != undefined) {
                insideBlock = Blocks[blockX][blockY][blockZ] > 0;
            }

        }

        // push()
        // translate(-FieldSize[0] / 2, -FieldSize[1] / 2, -FieldSize[2] / 2);
        // translate(blockSize / 2, blockSize / 2, blockSize / 2); // offset by half a block (so the blocks are centered on the blo
        // translate(blockX * blockSize, blockY * blockSize, blockZ * blockSize);
        // noFill();
        // stroke(0, 200, 120, 40);
        // box(blockSize);
        // pop()



        // bSpot1: // block spot 1
        /// look at all of the blocks around the agent
        // for (let i = blockX - 1; i <= blockX + 1; i++) {
        //     for (let j = blockY - 1; j <= blockY + 1; j++) {
        //         for (let k = blockZ - 1; k <= blockZ + 1; k++) {
        //             // if the block is not empty, check to see if the agent is inside of it
        //             if (i >= 0 && j >= 0 && k >= 0 && i < Blocks.length && j < Blocks[0].length && k < Blocks[0][0].length) {
        //                 if (Blocks[i][j][k] != 0) {
        //                     // if the agent is inside of the block, set insideBlock to true
        //                     let bminX = i * blockSize;
        //                     let bmaxX = (i + 1) * blockSize;
        //                     let bminY = j * blockSize;
        //                     let bmaxY = (j + 1) * blockSize;
        //                     let bminZ = k * blockSize;
        //                     let bmaxZ = (k + 1) * blockSize;

        //                     if (nextX >= bminX && nextX <= bmaxX && nextY >= bminY && nextY <= bmaxY && nextZ >= bminZ && nextZ <= bmaxZ) {
        //                         insideBlock = true;
        //                         console.log("inside block");
        //                         break bSpot1;
        //                     }
        //                 }
        //             }

        //         }
        //     }
        // }

        if (insideBlock) {
            mx = 0;
            my = 0;
            mz = 0;
        }



        // update the agents position
        this.pos.x += mx;
        this.pos.y += my;
        this.pos.z += mz;

        // if (insideBlock) {
        //     // draw a sphere  here to show the agents position
        //     push();
        //     translate(this.pos.x, this.pos.y, this.pos.z);
        //     fill(this.colorR, this.colorG, this.colorB);
        //     sphere(10);
        //     pop();
        // }



    }

    update() {

        this.age++;

        let insideFood = false;

        // if agent is inside of food spot, add to fitness and remove one from food spot ammt
        for (let i = 0; i < FoodSpots.length; i++) {
            let d = dist(this.pos.x, this.pos.y, this.pos.z, FoodSpots[i].pos.x, FoodSpots[i].pos.y, FoodSpots[i].pos.z);
            if (d < FoodSpots[i].radius) {

                insideFood = true;

                // add this food to the food eaten array if it is not already in it
                if (!this.foodEaten.includes(FoodSpots[i].id)) {
                    this.foodEaten.push(FoodSpots[i].id);
                }

                if (FoodSpots[i].ammt > 0) {

                    this.fitness += 1;
                    this.energy += 1;
                    this.age -= 20;
                    if (this.age < 0) {
                        this.age = 0;
                    }
                    FoodSpots[i].ammt -= 1;



                }


                // if (FoodSpots[i].ammt <= 0) {
                //     FoodSpots.splice(i, 1);
                // }

            }
        }

        if (insideFood) {
            push()
            translate(this.pos.x, this.pos.y, this.pos.z);
            noStroke();
            fill(this.colorR, this.colorG, this.colorB);
            sphere(2.5, 4, 4);
            pop()
        }
        // run brains




        for (var intI = 0; intI < this.brains.length; intI++) {
            this.brains[intI].RunSynapse(this);
        }

        if (this.pos.x > FieldSize[0] / 2) {
            this.pos.x = FieldSize[0] / 2;
            this.age += 1;
        }
        if (this.pos.x < -FieldSize[0] / 2) {
            this.pos.x = -FieldSize[0] / 2;
            this.age += 1;
        }
        if (this.pos.y > FieldSize[1] / 2) {
            this.pos.y = FieldSize[1] / 2;
            this.age += 1;
        }
        if (this.pos.y < -FieldSize[1] / 2) {
            this.pos.y = -FieldSize[1] / 2;
            this.age += 1;
        }
        if (this.pos.z > FieldSize[2] / 2) {
            this.pos.z = FieldSize[2] / 2;
            this.age += 1;
        }
        if (this.pos.z < -FieldSize[2] / 2) {
            this.pos.z = -FieldSize[2] / 2;
            this.age += 1;
        }



        if (this.Ppos.length > 0) {
            let distFromLast = dist(this.pos.x, this.pos.y, this.pos.z, this.Ppos[this.Ppos.length - 1].x, this.Ppos[this.Ppos.length - 1].y, this.Ppos[this.Ppos.length - 1].z);
            this.totalMovement += distFromLast;
            this.energy -= distFromLast / 1000;
        }
        // add a copy of the current position to the previous positions array
        this.Ppos.push(createVector(this.pos.x, this.pos.y, this.pos.z));

        // if there are more than 100 previous positions, remove the oldest one
        // if (this.Ppos.length > tailLength) {
        //     this.Ppos.splice(0, 1);
        // }

        this.IntPos.x = round(this.pos.x);
        this.IntPos.y = round(this.pos.y);
        this.IntPos.z = round(this.pos.z);





        // console.log("update");
        // update the agents position based on the dna



    }

    show() {


        stroke(this.colorR, this.colorG, this.colorB);
        strokeWeight(10);
        point(this.pos.x, this.pos.y, this.pos.z);
        strokeWeight(.5)

        // push();
        // translate(this.IntPos.x, this.IntPos.y, this.IntPos.z);
        // noStroke();
        // fill(this.colorR, this.colorG, this.colorB);
        // box(1);
        // pop();


        // for (var intI = 0; intI < this.Ppos.length - 1; intI++) {
        //     push();

        //     stroke(this.colorR, this.colorG, this.colorB);
        //     line(this.Ppos[intI].x, this.Ppos[intI].y, this.Ppos[intI].z, this.Ppos[intI + 1].x, this.Ppos[intI + 1].y, this.Ppos[intI + 1].z);
        //     // translate(this.Ppos[intI].x, this.Ppos[intI].y, this.Ppos[intI].z);


        //     // noStroke();
        //     // fill(this.colorR, this.colorG, this.colorB);
        //     // sphere(.5);
        //     pop();
        //     // stroke(this.colorR, this.colorG, this.colorB);
        //     // line(this.Ppos[intI].x, this.Ppos[intI].y, this.Ppos[intI].z, this.Ppos[intI + 1].x, this.Ppos[intI + 1].y, this.Ppos[intI + 1].z);
        // }




    }

}







class ABrain {
    constructor(brainGenes) {
        this.geneSet = brainGenes;
        this.GSequence = hex2bin(brainGenes); // converts to binary

        this.source_type = int(this.GSequence[0]); // choose input sensory or internal neuron source

        this.source_ID = this.GSequence.substring(1, 8); // specific neuron source id in binary
        this.source_ID = parseInt(this.source_ID, 2); // convert back to number

        this.sink_type = int(this.GSequence[8]); // trigger an internal neuron or an output action neuron

        this.sink_id = this.GSequence.substring(9, 16); // specific neuron source id in binary
        this.sink_id = parseInt(this.sink_id, 2); // convert back to number

        this.connection_weight = this.GSequence.substring(16, 32);
        this.connection_weight = parseInt(this.connection_weight, 2); // convert back to number
        this.connection_weight /= 10000;

        this.responsiveness = 1;
        this.clockSpeed = 1;
        this.internalClock = 0;

        this.senses = [
            this.Sens_CurrentHeading,
            this.Sens_OffRoad,
            this.Sens_HeadingToCheckpoint,
            this.Sens_HeadingToNextCheckpoint,
            this.Sens_HeadingToFuturePoint,
            this.Sens_TurnTowardsFuturePoint,
            this.Sens_TurnTowardsCheckpoint,
            this.Sens_DistToCheckpoint,
            this.Sens_TurnDirection,
            this.Sens_FrontOffRoad,
            this.Sens_FrontRightOffRoad,
            this.Sens_FrontLeftOffRoad,
            this.Sens_WrongWay,
            this.Sens_Acceleration,
            this.Sens_Random,
            this.Sens_Osc
        ];

        this.source_ID = this.source_ID % this.senses.length;
        
        this.actions = [
            this.Act_Forward,
            this.Act_Reverse,
            this.Act_TurnLeft,
            this.Act_TurnRight,
            this.Act_Break
        ];


        this.sink_id = this.sink_id % this.actions.length;

        if (debugBrain) {
            console.log("GSequence: " + this.GSequence);
            console.log("source_type: " + this.source_type);
            console.log("source_ID: " + this.source_ID);
            console.log("sink_type: " + this.sink_type);
            console.log("sink_id: " + this.sink_id);
            console.log("connection_weight: " + this.connection_weight);
            console.log("____")
        }
    }

    RunSynapse(agentObj) {

        if (debugBrain) console.log("---- Start Synapse ----");

        let sensVal = 0;
        if (this.source_type == 1) {
            // is an external sense
            sensVal = this.senses[this.source_ID](agentObj);
        } else {
            // is an internal neuron value
            sensVal = agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length]; // sets the sense as from an internal neuron
            if (debugBrain) console.log("sens internal neuron : " + agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length]);
        }

        sensVal *= this.connection_weight; // the connection weight is part of the genome, it will decide how strong to make the connection, can become negative
        sensVal *= this.responsiveness; // the responsiveness is a variable that can be changed by the agent, it will decide how strong to make the connection, can become negative
        if (debugBrain) console.log("connection trigger : " + sensVal);

        if (this.sink_type == 1) {
            // is an external action
            this.actions[this.sink_id](sensVal, agentObj);
        } else {
            // sink to internal neuron value
            let cval = agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length];  // current value in the internal neuron
            // let setTo = Math.tanh((cval + sensVal));//does a tanh function for some reason idk why
            let setTo = (cval + sensVal) / 2;
            if (isNaN(setTo)) {
                setTo = 0;
            }
            agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length] = setTo;

            if (debugBrain) console.log("set internal neuron : " + setTo);
        }

        if (debugBrain) console.log("---- END Synapse ----");
    }


    //  #####  ####### #     #  #####  #######  #####
    // #     # #       ##    # #     # #       #     #
    // #       #       # #   # #       #       #
    //  #####  #####   #  #  #  #####  #####    #####
    //  	 # #       #   # #       # #             #
    // #     # #       #    ## #     # #       #     #
    //  #####  ####### #     #  #####  #######  #####




    Sens_CurrentHeading(agentObj) {
        let posX = 1;
        let posY = 1;
        let localDirection = PI - (agentObj.carTheta - PI / 2);
        // let sensAmmt = agentObj.carTheta - PI / 2
        // sensAmmt -= PI;
        
        if (debugBrain) console.log('sens car heading : ' + localDirection)
        // console.log(agentObj.Selected)
        if (agentObj.Selected == true) {
            // console.log('heading')
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, map(localDirection, -PI, PI, 0, 1));
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            fill(255);
            brainView.text("Heading : " + localDirection, (posX * 10) + 15, (posY * 10) + 5);
        }
        // drawArrow(agentObj.frontAxle, localDirection)
        
        return localDirection;
    }

    Sens_OffRoad(agentObj) {
        let posX = 1;
        let posY = 2;


        let returnVal = 0
        if (agentObj.OffRoad) {
            returnVal = 1;
        } else {
            returnVal = 0;
        }
        
        if (agentObj.Selected) {
            let cN = lerpColor(colorLow, colorHigh, returnVal)
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            fill(255);
            brainView.text("is Off Road : " + returnVal, (posX * 10) + 15, (posY * 10) + 5);
        }
        
    }
    
    Sens_FrontOffRoad(agentObj) {
        let posX = 1;
        let posY = 3;

        let returnVal = 0
        if (agentObj.FrontOffRoad == true) {
            returnVal = 1;
        } else {
            returnVal = 0;
        }
        
        if (agentObj.Selected) {
            let cN = lerpColor(colorLow, colorHigh, returnVal)
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            fill(255);
            brainView.text("front is Off Road : " + returnVal, (posX * 10) + 15, (posY * 10) + 5);
        }
        
    }
    
    Sens_FrontLeftOffRoad(agentObj) {
        let posX = 1;
        let posY = 4;

        let returnVal = 0
        if (agentObj.FrontLeftOffRoad == true) {
            returnVal = 1;
        } else {
            returnVal = 0;
        }
        
        if (agentObj.Selected) {
            let cN = lerpColor(colorLow, colorHigh, returnVal)
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            fill(255);
            brainView.text("front Left is Off Road : " + returnVal, (posX * 10) + 15, (posY * 10) + 5);
        }
    }
    
    Sens_FrontRightOffRoad(agentObj) {
        let posX = 1;
        let posY = 5;

        let returnVal = 0
        if (agentObj.FrontRightOffRoad == true) {
            returnVal = 1;
        } else {
            returnVal = 0;
        }
        
        if (agentObj.Selected) {
            let cN = lerpColor(colorLow, colorHigh, returnVal)
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            fill(255);
            brainView.text("front Right is Off Road : " + returnVal, (posX * 10) + 15, (posY * 10) + 5);
        }
    }
    
    Sens_TurnTowardsCheckpoint(agentObj) {
        let posX = 1;
        let posY = 6;
        
        let npts = circleTrack.numPoints;
        let nextCP = circleTrack.Checkpoints[agentObj.lastCheckpoint % npts]
        let distToCP = p5.Vector.dist(agentObj.frontAxle, nextCP);
        
        let headingVec = createVector(nextCP.x - agentObj.rearAxle.x, nextCP.y - agentObj.rearAxle.y);
        let dirToNext = headingVec.heading();
        //dirToNext += PI
        fill(0);
        let localDirection = PI - (agentObj.carTheta - PI / 2);
        // let targetDir = dirToNext;
        // text(dirToNext, nextCP.x + 30, nextCP.y)
        let returnVal = localDirection - dirToNext
        if (returnVal < -PI) {
            returnVal += TWO_PI
        }
        if (returnVal > PI) {
            returnVal -= TWO_PI
        }
        // text(returnVal, agentObj.frontAxle.x + 50, agentObj.frontAxle.y);
        fill(0)
        if (debugBrain) console.log('sens turn to checkpoint : ' + returnVal)
        
        if (agentObj.Selected) {
        
        
            if (returnVal < -2) {
                returnVal += TWO_PI;
                brainView.fill(200, 0, 0);
            }
            if (returnVal > 2) {
                returnVal -= TWO_PI;
            }
            returnVal %= PI;
        
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, map(returnVal, -PI, PI, 0, 1));
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
        
            brainView.text("Turn Towards Checkpoint : " + returnVal.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        return returnVal;
    }
        
    Sens_HeadingToCheckpoint(agentObj) {
        let posX = 1;
        let posY = 7;
        
        let npts = circleTrack.numPoints;
        let nextCP = circleTrack.Checkpoints[agentObj.lastCheckpoint % npts]
        let distToCP = p5.Vector.dist(agentObj.frontAxle, nextCP);
        
        let headingVec = createVector(nextCP.x - agentObj.rearAxle.x, nextCP.y - agentObj.rearAxle.y);
        let dirToNext = headingVec.heading();
        // dirToNext += PI / 2
        if (debugBrain) console.log('sens heading to checkpoint : ' + dirToNext)

        if (agentObj.Selected) {
        brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, map(dirToNext, -PI, PI, 0, 1));
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
        brainView.fill(10);
            brainView.text("heading to checkpoint : " + dirToNext.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        // drawArrow(agentObj.frontAxle, dirToNext)
        return dirToNext;
        }
        
    Sens_HeadingToNextCheckpoint(agentObj) {
        let posX = 1;
        let posY = 8;
        
        let npts = circleTrack.numPoints;
        let nextCP = circleTrack.Checkpoints[(agentObj.lastCheckpoint + 1) % npts]
        let distToCP = p5.Vector.dist(agentObj.frontAxle, nextCP);
        
        let headingVec = createVector(nextCP.x - agentObj.rearAxle.x, nextCP.y - agentObj.rearAxle.y);
        let dirToNext = headingVec.heading();
        // dirToNext += PI / 2
        if (debugBrain) console.log('sens heading to next checkpoint : ' + dirToNext)
        
        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, map(dirToNext, -PI, PI, 0, 1));
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("heading to next checkpoint : " + dirToNext.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        // drawArrow(agentObj.frontAxle, dirToNext)
        return dirToNext;
    }
        
    Sens_HeadingToFuturePoint(agentObj) {
        let posX = 1;
        let posY = 9;
        
        let futurePoint = agentObj.targetPoint;
        if (futurePoint != null) {
            let distToCP = p5.Vector.dist(agentObj.frontAxle, futurePoint);
        
            let headingVec = createVector(futurePoint.x - agentObj.rearAxle.x, futurePoint.y - agentObj.rearAxle.y);
            let dirToNext = headingVec.heading();
            dirToNext
            if (debugBrain) console.log('sens heading future roadpoint : ' + dirToNext)

            if (agentObj.Selected) {
                brainView.noStroke();
                let cN = lerpColor(colorLow, colorHigh, map(dirToNext, -PI, PI, 0, 1));
                brainView.fill(cN);
                brainView.ellipse(posX * 10, posY * 10, 10, 10);
                brainView.fill(10);
                brainView.text("heading to future roadpoint : " + dirToNext.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
    }
    
            // drawArrow(agentObj.frontAxle, dirToNext)
            return dirToNext;
        }
        
    }

    Sens_TurnTowardsFuturePoint(agentObj) {
        let posX = 1;
        let posY = 10;

        let dirToNext = 0;
        let futurePoint = agentObj.targetPoint;

        if (futurePoint != null) {
            let distToCP = p5.Vector.dist(agentObj.frontAxle, futurePoint);

            let headingVec = createVector(futurePoint.x - agentObj.rearAxle.x, futurePoint.y - agentObj.rearAxle.y);
        let dirToNext = headingVec.heading();
        
            // if (debugBrain) console.log('sens turn to future roadpoint : ' + dirToNext)



            // drawArrow(agentObj.frontAxle, dirToNext)

            fill(0);

            let localDirection = PI - (agentObj.carTheta - PI / 2);

            let returnVal = localDirection - dirToNext
            if (returnVal < -PI) {
                returnVal += TWO_PI
            }
            if (returnVal > PI) {
                returnVal -= TWO_PI
            }

            if (agentObj.Selected) {
                brainView.noStroke();
                let cN = lerpColor(colorLow, colorHigh, map(returnVal, -PI, PI, 0, 1));
                brainView.fill(cN);
                brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
                brainView.text("turn to future roadpoint : " + returnVal.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        
            return returnVal;
    }
    
    }

    Sens_DistToCheckpoint(agentObj) {
        let posX = 1;
        let posY = 11;

        let nextCP = circleTrack.Checkpoints[agentObj.lastCheckpoint % 10]

        let distToCP = p5.Vector.dist(agentObj.frontAxle, nextCP);
        if (debugBrain) console.log('sens distance to checkpoint : ' + distToCP / width)
        
        
        let returnVal = distToCP / width;
        
        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, 1 - returnVal);
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("Distance to Checkpoint : " + returnVal.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        
        return returnVal;
    }
    
    Sens_TurnDirection(agentObj) {
        let posX = 1;
        let posY = 12;

        let turnDir = agentObj.turnDirection;
        if (debugBrain) console.log('sens turn direction : ' + turnDir)
        
        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, map(turnDir, -PI, PI, 0, 1));
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("turn direction : " + turnDir.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        
        return turnDir;
    }
    
    Sens_WrongWay(agentObj) {
        let posX = 1;
        let posY = 13;

        let returnVal = 0;
        if (agentObj.wrongWay) {
            returnVal = 0;
        } else {
            returnVal = 1;
        }
        
        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, returnVal);
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("WrongWay : " + returnVal, (posX * 10) + 15, (posY * 10) + 5);
        }
        
        
    }
    
    Sens_Acceleration(agentObj) {
        let posX = 1;
        let posY = 14;

        
        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, map(agentObj.acceleration, -1, 1, 0, 1));
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("acceleration : " + agentObj.acceleration.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        
        return (agentObj.acceleration)
        
        
    }
    
    Sens_Random(agentObj) {
        let posX = 1;
        let posY = 15;

        let randN = random(-1, 1);
        if (debugBrain) console.log("sens random : " + randN);
        
        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, randN);
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("random : " + randN.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        
        return randN;
    }
    
    Sens_Osc(agentObj) {			// oscillator
        let posX = 1;
        let posY = 16;

        agentObj.internalClock += agentObj.clockSpeed;
        let newClock = sin(agentObj.internalClock);
        
        if (debugBrain) console.log("sens Internal Clock : " + newClock);
        
        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, map(newClock, -1, 1, 0, 1));
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("osc : " + newClock.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }
        
        return newClock;
    }
    
    
    // ACTIONS
    //     #     #####  ####### ### ####### #     #  #####
    //    # #   #     #    #     #  #     # ##    # #     #
    //   #   #  #          #     #  #     # # #   # #
    //  #     # #          #     #  #     # #  #  #  #####
    //  ####### #          #     #  #     # #   # #       #
    //  #     # #     #    #     #  #     # #    ## #     #
    //  #     #  #####     #    ### ####### #     #  #####
    
    
    
    
    Act_Forward(trigger, agentObj) {
        let posX = 45;
        let posY = 2;

        if (trigger > 0.5) {
            if (debugBrain) console.log("Move Forward  :  ")
            agentObj.accelerate();
        }

        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, trigger);
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("Move Forward : " + trigger.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }

    }
    
    Act_Reverse(trigger, agentObj) {
        let posX = 45;
        let posY = 3;

        if (trigger > 0.5) {
            if (debugBrain) console.log("Move Reverse  :  ")
            agentObj.reverse();
        }


        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, trigger);
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("reverse : " + trigger.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }

    }
    
    
    Act_TurnLeft(trigger, agentObj) {
        let posX = 45;
        let posY = 4;

        if (trigger > 0.5) {
            if (debugBrain) console.log("Move turn left  :  ")
            agentObj.turnLeft();
        }


        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, trigger);
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("turn left : " + trigger.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }

    }
    
    Act_TurnRight(trigger, agentObj) {
        let posX = 45;
        let posY = 5;

        if (trigger > 0.5) {
            if (debugBrain) console.log("Move turn right  :  ")
            agentObj.turnRight();
        }

        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, trigger);
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("turn right : " + trigger.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }

    }
    
    Act_Break(trigger, agentObj) {
        let posX = 45;
        let posY = 6;

        if (trigger > 0.5) {
            if (debugBrain) console.log(" Break  :  ")
            agentObj.break();
        }

        if (agentObj.Selected) {
            brainView.noStroke();
            let cN = lerpColor(colorLow, colorHigh, trigger);
            brainView.fill(cN);
            brainView.ellipse(posX * 10, posY * 10, 10, 10);
            brainView.fill(10);
            brainView.text("break : " + trigger.toFixed(2), (posX * 10) + 15, (posY * 10) + 5);
        }

    }
    
    
}


const RoadType = {
    None: Symbol("none"),
    Road: Symbol("road"),
    Gravel: Symbol("gravel")
  };
  
  class Road {
    constructor(GridWidth, GridHHeight, defaultRoadType=RoadType.None){  
    //   super(GridWidth, GridHHeight);
    //   this.fill(defaultRoadType);
      
      this.numPoints = 10;
      let angEach = TWO_PI/this.numPoints;
      
      this.Checkpoints = [];
      
      this.roadImg = createGraphics(GridWidth, GridHHeight);
      
      for (let index = 0; index < this.numPoints; index++) {
        let radius = random(200,GridWidth*.5);
        let xPos = sin((angEach)*index)*radius;
        let yPos = cos(angEach*index)*radius;
        let vecN = createVector(xPos, yPos);
        vecN.add(GridWidth/2,GridHHeight/2)
        this.Checkpoints.push(vecN);
      }
      
      this.startingLine = this.Checkpoints[0];
  
      let headingVec = createVector(this.Checkpoints[1].x -this.Checkpoints[0].x, this.Checkpoints[1].y-this.Checkpoints[0].y);
  
  
      this.startDir = headingVec.heading() 
      console.log(this.startDir)
    
    }
  
    generateRoadGrid(width, height) {
        
      for (let x = 0; x < GridWidth; x++){
        for (let y = 0; y < GridHHeight; y++){
          let c = this.roadImg.get(x, y);
          if(c[0] > 100){
            this.set(x, y, RoadType.Gravel);
          }else{
            this.set(x, y, RoadType.Road);
          }
        }
      }
      
    }
    
    
    drawRoad(){
      for (let index = 0; index < this.Checkpoints.length; index++) {
        let vecPos = this.Checkpoints[index];
        // ellipse(vecPos.x, vecPos.y, 30,30);
        
        let pindex = (index-1);
        if(pindex<0){
          pindex = this.Checkpoints.length-1
        }
        let pvecPos = this.Checkpoints[pindex];
        
        this.roadImg.strokeWeight(25)
        this.roadImg.stroke(60)
        this.roadImg.line(vecPos.x, vecPos.y, pvecPos.x, pvecPos.y)
        
      }
      image( this.roadImg,0,0);//, width, height)
    }
    
    findClosestTo(inx,iny){
      let closestFound = createVector(10000,10000,10000);
      let targetPos = createVector(inx, iny)
      
      let idx = 0;
      
      for (let index = 0; index < this.Checkpoints.length; index++) { // loop all checkpoints on the track. 
        let vecPos = this.Checkpoints[index];
        // vecPos.mult(2);
        let pindex = (index-1);
        if(pindex<0){
          pindex = this.Checkpoints.length-1
        }
        let pvecPos = this.Checkpoints[pindex];
        // pvecPos.mult(2);
        
        let distD = p5.Vector.dist(vecPos, pvecPos); // find the distance between two vector points. 
        
        
  
        for(let v = 0; v < distD; v+=1){ //interpolate between these two points. 
          let checkPoint = p5.Vector.lerp(vecPos, pvecPos, v/distD); // a point between two checkpoints. 
          
          // ellipse(checkPoint.x, checkPoint.y, 10,10);
          
          let checkDist = p5.Vector.dist(targetPos, checkPoint); // the distance between input and current look position
          // checkDist += (index + (v/distD))
         
          if(checkDist<closestFound.z){
            idx = (index + (1-(v/distD)))/this.Checkpoints.length
            closestFound.set(checkPoint.x, checkPoint.y, checkDist);
          }
        }
        
      }
      
      // closestFound.mult(2);
      
      
      return [closestFound, idx];
      
    }
  
    checkOnRoad(inx, iny){
      let foundF = this.findClosestTo(inx, iny);
              if(foundF[0].z < 20){
                 return false;
              }else{
                 return true;
              }
  
    }
    
    findPointAtFraction(inPercent){
      
      inPercent = inPercent%1
      
      let roadidx = inPercent *this.Checkpoints.length;
      let roadSpot = 1-(roadidx%1);
      roadidx = int(roadidx)
      
      // console.log()
      
      let vecPos = this.Checkpoints[roadidx];
      // vecPos.mult(2);
      // console.log(roadidx);
      
      let pindex = (roadidx-1);
      
      
      if(pindex<0){
        pindex =  this.Checkpoints.length-1
      }
      if(pindex >  this.Checkpoints.length){
        pindex = 0;
      }
      
      // console.log(pindex);
      
      
      let pvecPos = this.Checkpoints[pindex];
      
      // console.log(pvecPos)
      
      fill(200,0,0);
      // ellipse(vecPos.x, vecPos.y, 20,20);
      // ellipse(pvecPos.x, pvecPos.y, 20, 20);
      // pvecPos.mult(2);
      
      // let distD = p5.Vector.dist(vecPos, pvecPos); // find the distance between two vector points. 
      
      let foundPoint = p5.Vector.lerp(vecPos, pvecPos, roadSpot); // a point between two checkpoints. 
      
      return foundPoint;
      
      
    }
    
  }
  

  class Car {
	constructor(startx, starty, startDir, genomeSequenceIn) {
		this.GSequence = genomeSequenceIn;
		this.carColor = "#";
		
		for (let gi = 0; gi < 6; gi += 1) {
			const element = this.GSequence[gi];
			this.carColor += element.substring(0, 1);
		}
		// console.log(this.carColor)
		
		this.brains = [];
		this.Selected = false;
		this.age = 0;
		this.InternalNeurons = [0, 0, 0, 0, 0, 0];
		this.FarthestDistance = 0;
		this.FrontOffRoad = false;
		this.FrontLeftOffRoad = false;
		this.FrontRightOffRoad = false;
		this.targetPoint; // a point in the future that we should arrive at ( on road .3 forward)
		this.Gasoline = gasFillup; // total gas in the car
		
		for (var intI = 0; intI < this.GSequence.length; intI++) {
			let synapse = new ABrain(this.GSequence[intI]);
			this.brains.push(synapse);
		}
		
		this.rearAxle = createVector(startx, starty);
		
		this.frontAxle = createVector(0, 0);
		
		this.wrongWay = false; // car starts driving the correct direction
		
		this.lastCheckpoint = 1;
		
		this.internalClock = 0;
		this.clockSpeed = 0.01;
		
		this.OffRoad = false;
		
		// Angle of car
		this.carTheta = (-startDir) - PI / 2;
		
		// console.log("STARTING CAR AT " + this.carTheta  + "degrees")
		
		this.acceleration = 0;
		this.breaking = false;
		// Car width and height
		this.carS = [50 * carScale, 100 * carScale];
		// Tire width and height
		this.tireW = 10 * carScale;
		this.tireH = 20 * carScale;
		// Rear Axle offset from back edge of car
		this.off = 15 * carScale;
		// Max and min turning radii
		this.maxR = 2000 * carScale; // Max turning radius // can be too high and ineffective. 
		// this basically deturmines how "sporty" the steering is on more straight angles
		this.minR = this.carS[1] * 1.2; // Min turning radius is a little more then one car length
		// Car speeds
		this.speed = 0;
		this.maxSpeed = 1000 * carScale; // Higher is faster
		this.turnSpeed = 100 * carScale; // Lower is faster
		this.turnRadius = this.maxR;  //the turn radius becomes the size of the arc the car will follow, 
		//A large arc is a slight turn, a small turn radius becomes a sharp turn. 
		// assigning this to the maxR is essentially infinate radius, so no rotation in either direction. 
		
		// the current direction tires are turned. 
		this.turnDirection = random(-0.1, -1);
		this.cor = createVector(
			// cor is the rotation point for the car, this defines the arc that the car takes.
			
			this.rearAxle.x + this.turnRadius * cos(this.carTheta),
			this.rearAxle.y - this.turnRadius * sin(this.carTheta)
			);
			this.forwardTarget = createVector(-1, -1); // a vector we will use as a target for the car, a position on the road in front of the car
			this.angleToTarget = 0;// an angle we can calculate from the car to the forward target. 
		}
		
		
		checkClick(inx, iny) {
			if (abs(this.rearAxle.x - inx) < 10 && abs(this.rearAxle.y - iny) < 10) {
				return true;
			}
			else {
				return false;
			}
		}
		
		accelerate(ammt) {
			if (this.acceleration != 1) {
				this.acceleration += 0.01;
			}
		}
		
		reverse() {
			if (this.acceleration != -1) {
				this.acceleration -= 0.01;
			}
		}
		
		turnLeft() {
			// turning is just moving the cor vector by adjusting the turnRadius
			// if you are turning right, the cor vector and rotation arc is to the right
			// if you are turning left, the cor vector and rotation arc is to the left
			
			if (sign(this.turnRadius) == 1) {
				this.turnRadius += 3 * abs(this.turnRadius / this.turnSpeed);
			}
			
			if ((sign(this.turnRadius) == -1) & (this.turnRadius < -this.minR)) {
				this.turnRadius += 3 * abs(this.turnRadius / this.turnSpeed);
			}
			
			if (this.turnRadius > this.maxR) {
				this.turnRadius = -this.maxR;
			}
			// this.cor.x = this.rearAxle.x + this.turnRadius * cos(this.carTheta);
			// this.cor.y = this.rearAxle.y - this.turnRadius * sin(this.carTheta);
		}
		
		turnRight() {
			// turning is just moving the cor vector by adjusting the turnRadius
			// if you are turning right, the cor vector and rotation arc is to the right
			// if you are turning left, the cor vector and rotation arc is to the left
			
			if (sign(this.turnRadius) == -1) {
				this.turnRadius -= 3 * abs(this.turnRadius / this.turnSpeed);
			}
			
			if ((sign(this.turnRadius) == 1) & (this.turnRadius > this.minR)) {
				this.turnRadius -= 3 * abs(this.turnRadius / this.turnSpeed);
			}
			
			if (this.turnRadius < -this.maxR) {
				this.turnRadius = this.maxR;
			}
		}
		
		break() {
			if (abs(this.acceleration) >= 0) {
				this.acceleration -= this.acceleration * 0.08;
			}
			this.breaking = true;
		}
		
		runBrain() {
			if (this.Selected) {
				brainView.background(100);
			}
			
			if (debugBrain) console.log("===============START BRAIN===============");
			for (let s in this.brains) {
				// this.brains[s].viewBrain= this.Selected
				this.brains[s].RunSynapse(this);
			}
			
			if (this.Selected) {
				for (let INeu = 0; INeu < this.InternalNeurons.length; INeu++) {
					let INN = this.InternalNeurons[INeu];
					let posX = 23;
					let posY = INeu + 3;
					let cN = lerpColor(colorLow, colorHigh, INN)
					brainView.fill(cN);
					brainView.ellipse(posX * 10, posY * 12, 10, 10);
					fill(255);
					brainView.text("IN  : " + INN, (posX * 10) + 15, (posY * 12) + 5);
				}
			}
			
			if (debugBrain) console.log("===============END BRAIN===============")
			this.age += 1;
			// this.energy-=.1
		}
		
		update(idx) {
			this.Gasoline -= 1;
			
			this.cor.x = this.rearAxle.x + this.turnRadius * cos(this.carTheta);
			this.cor.y = this.rearAxle.y - this.turnRadius * sin(this.carTheta);
			
			// this.nextCheckpoint = (this.lastCheckpoint+1)%10;
			
			let nextCP = circleTrack.Checkpoints[this.lastCheckpoint % 10]
			let distToCP = p5.Vector.dist(this.frontAxle, nextCP)
			if (distToCP < 20) {
				// console.log("GOT TO CHECKPOINT!")
				
				this.lastCheckpoint = (this.lastCheckpoint + 1);
				if (this.lastCheckpoint == 11) {
					console.log("DID FULL LOOP");
					
					// get the stored array of winners from local storage and add this sequence if not already there
					let winners = JSON.parse(localStorage.getItem("winners"));
					if (winners == null) {
						winners = [];
					}
					if (winners.indexOf(this.GSequence) == -1) {
						winners.push(this.GSequence);
						localStorage.setItem("winners", JSON.stringify(winners));
					}
					
					console.log(this.age)
					console.log(this.GSequence)
					this.Gasoline = 5; // this will end the car fast
				}
				this.Gasoline = gasFillup; // refill gas on every checkpoint.
			}
			
			let headingVec = createVector(nextCP.x - this.rearAxle.x, nextCP.y - this.rearAxle.y);
			let dirToNext = headingVec.heading();
			// drawArrow(this.rearAxle, dirToNext );
			dirToNext += PI
			// text(dirToNext, this.rearAxle.x+30, this.rearAxle.y)
			
			noFill();
			stroke(0)
			strokeWeight(.5)
			// circle(nextCP.x, nextCP.y, idx)
			// text(distToCP, nextCP.x, nextCP.y)
			
			if (this.speed > 0) {  // different for forward or reverse
				this.carTheta -=
				(0.01 * sign(this.turnRadius)) / abs(this.turnRadius / this.speed);
			} else {
				this.carTheta +=
				(0.01 * sign(this.turnRadius)) / abs(this.turnRadius / this.speed);
			}
			this.carTheta %= TWO_PI;
			if (this.carTheta - PI / 2 < 0) {
				this.carTheta += 6.283185307179586;
			}
			// drawArrow(this.rearAxle, -this.carTheta-PI/2 );
			// text(this.carTheta , ccar.rearAxle.x+30, ccar.rearAxle.y+10)
			
			let localDirection = this.carTheta - PI / 2;
			let targetDir = (TWO_PI - dirToNext);
			
			// console.log(localDirection  - targetDir);
			
			// let futurePosX = this.cor.x - this.turnRadius * cos(this.carTheta+PI/2);
			// let futurePosY = this.cor.y + this.turnRadius * sin(this.carTheta+PI/2);
			
			// if(this.turnRadius>0){
			//  futurePosX = this.cor.x - this.turnRadius * cos(this.carTheta-PI/2);
			//  futurePosY = this.cor.y + this.turnRadius * sin(this.carTheta-PI/2);
			// }
			
			// line(futurePosX,futurePosY, this.rearAxle.x, this.rearAxle.y);
			
			// let futurePos = createVector(futurePosX, futurePosY);
			
			this.rearAxle.x = this.cor.x - this.turnRadius * cos(this.carTheta);
			this.rearAxle.y = this.cor.y + this.turnRadius * sin(this.carTheta);
			
			// let turnDirection = createVector(this.rearAxle.x-futurePosX, this.rearAxle.y - futurePosY).heading()
			// drawArrow(this.rearAxle , turnDirection-PI);
			
			// console.log(turnDirection)
			
			
			if (this.acceleration != 0) { // add drag to car 
				this.acceleration -= this.acceleration * 0.005;
			}
			
			if (this.OffRoad) {
				this.Gasoline -= 50; // remove more gas if offroad
				if (abs(this.acceleration) >= 0) {
					this.acceleration -= this.acceleration * 0.01; // more drag when offroad
				}
			}
			
			this.acceleration = constrain(this.acceleration, -1, 1);
			this.speed = this.maxSpeed * this.acceleration;
			
			// // console.log(this.speed)
			// // Distances to front and rear tire from center rear axle
			let frontD = sqrt(
				((this.carS[0] - (2 * this.carS[0]) / 50) / 2) *
				((this.carS[0] - (2 * this.carS[0]) / 50) / 2) +
				(this.carS[1] - 0.35 * this.carS[1]) *
				(this.carS[1] - 0.35 * this.carS[1])
				);
				
				let frontTh = atan2(
					this.carS[1] - 0.35 * this.carS[1],
					(this.carS[0] - (2 * this.carS[0]) / 50) / 2
					);
					// // an angle based on the size of the car?
					
					// // console.log(frontTh)
					
					let rearD = (this.carS[0] - (2 * this.carS[0]) / 50) / 2;
					
					// Tire coordinates
					let frontLx = this.rearAxle.x - frontD * cos(frontTh - this.carTheta);
					let frontLy = this.rearAxle.y - frontD * sin(frontTh - this.carTheta);
					let frontRx = this.rearAxle.x + frontD * cos(frontTh + this.carTheta);
					let frontRy = this.rearAxle.y - frontD * sin(frontTh + this.carTheta);
					
					let rearLx = this.rearAxle.x - rearD * cos(this.carTheta);
					let rearLy = this.rearAxle.y + rearD * sin(this.carTheta);
					let rearRx = this.rearAxle.x + rearD * cos(this.carTheta);
					let rearRy = this.rearAxle.y - rearD * sin(this.carTheta);
					
					// Tire angles
					if (abs(this.turnRadius) < this.maxR) {
						this.leftTheta = atan2(this.cor.y - frontLy, this.cor.x - frontLx);
						this.rightTheta = atan2(this.cor.y - frontRy, this.cor.x - frontRx);
					} else {
						this.leftTheta = -this.carTheta;
						this.rightTheta = -this.carTheta;
					}
					
					let frontCx = this.rearAxle.x + frontD * cos(frontTh + this.carTheta);
					let frontCy = this.rearAxle.y - frontD * sin(frontTh + this.carTheta);
					
					let frontDir = 4.72;
					let ahead1x = this.rearAxle.x + ((frontD * 1.2) * cos(this.carTheta - frontDir));
					let ahdad1y = this.rearAxle.y - ((frontD * 1.2) * sin(this.carTheta - frontDir));
					
					this.frontAxle = createVector(ahead1x, ahdad1y);
					
					// ellipse(this.frontAxle.x, this.frontAxle.y, 20,20)
					
					let foundF = circleTrack.findClosestTo(this.frontAxle.x, this.frontAxle.y);
					this.OffRoad = circleTrack.checkOnRoad(this.frontAxle.x, this.frontAxle.y)
					
					if (foundF[0].z > 50) {
						this.Gasoline= -30;// more gas for off bounds
						// penalty
						// circle(this.frontAxle.x, this.frontAxle.y, 50);
					}
					
					if (this.OffRoad == false) { // needs to be on the road to count as progress
						let distanceTraveled = foundF[1] - .1;//constrain(, 0, (this.lastCheckpoint)/10);
						if (distanceTraveled > (this.lastCheckpoint) / 10) {
							distanceTraveled = (this.lastCheckpoint) / 10;
						}
						if (distanceTraveled > this.FarthestDistance) {
							this.FarthestDistance = distanceTraveled; // set the car's distance record
							addWinner(this.GSequence, distanceTraveled);
							
						}
					}
					
					let closestPointF = foundF[0]
					let trackFractionF = foundF[1]
					
					// ellipse(closestPointF.x, closestPointF.y, 30,30);
					fill(255);
					// text( trackFractionF , closestPointF.x, closestPointF.y)
					
					
					let foundR = circleTrack.findClosestTo(this.rearAxle.x, this.rearAxle.y);
					let closestPointR = foundR[0]
					let trackFractionR = foundR[1]
					fill(255);
					if (trackFractionR > trackFractionF) {
						this.wrongWay = true;
					} else {
						this.wrongWay = false;
					}
					
					let targetFraction = (trackFractionF + .03) % 1
					// let targetFraction = mouseX/width;
					
					this.targetPoint = circleTrack.findPointAtFraction(targetFraction)
					fill(0);
					// ellipse(targetPoint.x, targetPoint.y, 30,30);
					fill(255, 0, 0);
					// text( targetFraction, targetPoint.x, targetPoint.y)
					// ccar.forwardTarget
					
					this.turnDirection = atan2(this.cor.y - this.frontAxle.y, this.cor.x - this.frontAxle.x) - PI / 2
					
					this.turnDirection %= TWO_PI
					// this.carTheta %= TWO_PI
					// console.log(this.turnDirection, -this.carTheta-PI/2 );
		
					// console.log( -this.carTheta-PI/2 );
					let relAng = this.turnDirection + this.carTheta - PI / -2;
					relAng = abs(relAng);
					// if(abs(relAng)>PI/4){
					//     relAng-=PI;
					// }
					//    if(this.carTheta < 0){
					//     relAng = abs(relAng);
					
					//    }else{
					//     relAng = PI-relAng
					//    }
					
					// console.log( relAng );
					
					if (this.turnRadius < 0) {
						this.turnDirection = atan2(this.frontAxle.y - this.cor.y, this.frontAxle.x - this.cor.x) - PI / 2;
					}
					
					// if(ccar.carTheta-PI/2<0){
					//     ccar.carTheta+=6.283185307179586;
					// }

					let localTurn = (PI - this.turnDirection) % TWO_PI
					
					localDirection = this.carTheta - PI / 2;
					// console.log(localTurn + ':'+ localDirection)
					
					// drawArrow(this.rearAxle, this.turnDirection);
					// text(this.turnDirection, this.rearAxle.x+30, this.rearAxle.y+10)
					
					this.breaking = false;
					// // if (gridLookup(ahead1x, ahdad1y) == false) {
					// //     fill(0)
					// // } else {
					// //     fill(200)
					// // }
					// ellipse(ahead1x, ahdad1y, 10, 10)
					// testPoint(this.frontAxle.x, this.frontAxle.y)
					let ahead1Rx = this.rearAxle.x - ((frontD * 2) * cos(frontTh - this.carTheta));
					let ahead1Ry = this.rearAxle.y - ((frontD * 2) * sin(frontTh - this.carTheta));
					
					// testPoint(ahead1Rx, ahead1Ry)
					this.FrontLeftOffRoad = circleTrack.checkOnRoad(ahead1Rx, ahead1Ry)
					if (this.FrontLeftOffRoad) {
						fill(200, 100, 100)
					} else {
						fill(100, 200, 100)
					}
					// ellipse(ahead1Rx, ahead1Ry, 10, 10)

					let ahead1Lx = this.rearAxle.x + ((frontD * 2) * cos(frontTh + this.carTheta));
					let ahead1Ly = this.rearAxle.y - ((frontD * 2) * sin(frontTh + this.carTheta));
					// testPoint(ahead1Lx, ahead1Ly);
					this.FrontRightOffRoad = circleTrack.checkOnRoad(ahead1Lx, ahead1Ly)
					if (this.FrontRightOffRoad) {
						fill(200, 100, 100)
					} else {
						fill(100, 200, 100)
					}
					// ellipse(ahead1Lx, ahead1Ly, 10, 10)

					// let sideLx = this.rearAxle.x - ((frontD * 1.3) * cos(this.carTheta-.4));
					// let sideLy = this.rearAxle.y + ((frontD * 1.3) * sin(this.carTheta-.4));
					// testPoint(sideLx, sideLy);
					
					// let sideRx = this.rearAxle.x + ((frontD * 1.3) * cos(this.carTheta+.4));
					// let sideRy = this.rearAxle.y - ((frontD * 1.3) * sin(this.carTheta+.4));
					// testPoint(sideRx, sideRy);
					
					// let ahead2Rx = this.rearAxle.x + ((frontD * 3) * cos(frontTh +this.carTheta- .15));
					// let ahdad2Ry = this.rearAxle.y - ((frontD * 3) * sin(frontTh+ this.carTheta- .15));
					// testPoint(ahead2Rx, ahdad2Ry);
					
					// let ahead2Lx = this.rearAxle.x - ((frontD * 3) * cos(frontTh -this.carTheta - .15));
					// let ahdad2Ly = this.rearAxle.y - ((frontD * 3) * sin(frontTh - this.carTheta- .15));
					// testPoint(ahead2Lx, ahdad2Ly);

					let ahead2x = this.rearAxle.x + ((frontD * 1.8) * cos(this.carTheta - frontDir));
					let ahdad2y = this.rearAxle.y - ((frontD * 1.8) * sin(this.carTheta - frontDir));
					// testPoint(ahead2x, ahdad2y);

					this.FrontOffRoad = circleTrack.checkOnRoad(ahead2x, ahdad2y)
					if (this.FrontOffRoad) {
						fill(200, 100, 100)
					} else {
						fill(100, 200, 100)
					}
					// ellipse(ahead2x, ahdad2y, 10, 10)

					// let ahead3x = this.rearAxle.x + ((frontD * 4.5) * cos(this.carTheta - frontDir));
					// let ahdad3y = this.rearAxle.y - ((frontD * 4.5) * sin(this.carTheta - frontDir));
					// testPoint(ahead3x, ahdad3y);
					
					// let behindDir = 1.6;
					
					// let behind1x = this.rearAxle.x + ((frontD * 1.2) * cos(this.carTheta - behindDir));
					// let behind1y = this.rearAxle.y - ((frontD * 1.2) * sin(this.carTheta - behindDir));
					// testPoint(behind1x, behind1y);

					// // Draw front tires
					// fill(0);
					// rectAngle(
					//     frontLx,
					//     frontLy,
					//     this.tireW,
					//     this.tireH,
					//     this.tireH / 2,
					//     -this.leftTheta
					// );
					// rectAngle(
					//     frontRx,
					//     frontRy,
					//     this.tireW,
					//     this.tireH,
					//     this.tireH / 2,
					//     -this.rightTheta
					// );
					
					// // Draw rear tires
					// rectAngle(
					//     rearLx,
					//     rearLy,
					//     this.tireW,
					//     this.tireH,
					//     this.tireH / 2,
					//     this.carTheta
					// );
					// rectAngle(
					//     rearRx,
					//     rearRy,
					//     this.tireW,
					//     this.tireH,
					//     this.tireH / 2,
					//     this.carTheta
					// );
					
					
					// let frontBumper = createVector(0, this.carS[1]);
					// frontBumper.add(this.rearAxle)
					
					
					// ellipse(frontBumper.x, frontBumper.y, 30, 30)
					// frontBumper.setHeading(5);
					// print(frontBumper)
					
					
					// rectAngle(
					//   this.rearAxle.x,
					//   this.rearAxle.y,
					//   this.carS[0],
					//   this.carS[1],
					//   this.off,
					//   this.carTheta
					// );
					
					fill(0);
					
					// Windshields
					// rectAngle(
					//     this.rearAxle.x,
					//     this.rearAxle.y,
					//     (4 * this.carS[0]) / 5,
					//     0.15 * this.carS[1],
					//     (-47 * this.carS[1]) / 100,
					//     this.carTheta
					// );
					// rectAngle(
					//     this.rearAxle.x,
					//     this.rearAxle.y,
					//     (4 * this.carS[0]) / 5,
					//     0.13 * this.carS[1],
					//     (-5 * this.carS[1]) / 100,
					//     this.carTheta
					// );
					
					// let rearB = this.carS[0] * 0.25;
					// let rearBLx = this.rearAxle.x - rearB * cos(this.carTheta);
					// let rearBLy = this.rearAxle.y + rearB * sin(this.carTheta);
					// let rearBRx = this.rearAxle.x + rearB * cos(this.carTheta);
					// let rearBRy = this.rearAxle.y - rearB * sin(this.carTheta);
					
					// fill(20);
					// if (this.breaking) {
					//     fill(200, 0, 0);
					// }
					
					// rectAngle(
					//     rearBLx,
					//     rearBLy,
					//     this.tireW,
					//     this.carS[1] * 0.1,
					//     this.carS[1] * 0.1,
					//     this.carTheta
					// );
					// rectAngle(
					//     rearBRx,
					//     rearBRy,
					//     this.tireW,
					//     this.carS[1] * 0.1,
					//     this.carS[1] * 0.1,
					//     this.carTheta
					// );
					
					
				}
				
				drawCar() {
					
					// Draw the car
					stroke(1);
					strokeWeight(1);
					// fill(130,130,250)
					// fill(130,250, 130)
					
					// if (this.OffRoad) {
					//     fill(250, 100, 100);
					// }
					// else {
					//     fill(100, 250, 100);
					// }

					// let colorN = '#' + this.GSequence[0].substring(0, 3)
					// fill(colorN)
					
					fill(this.carColor)
					
					push()
					translate(this.rearAxle.x, this.rearAxle.y);
					rotate(-this.carTheta)
					rect(-this.carS[0] / 2, 8 - this.carS[1], this.carS[0], this.carS[1])
					
					// text(this.FarthestDistance, 20,0);
					
					// text( (this.lastCheckpoint)/10, 20, 10);
					
					fill(240, 240, 240);
					noStroke();
					
					
					// windshields
					// fill(0);
					// let WS_width = this.carS[0] * .7;
					// rect(-WS_width / 2, -this.carS[1] * .05, WS_width, WS_width / 2.4)
					// rect(-WS_width / 2, -this.carS[1] * .5, WS_width, WS_width / 2.4)

					//breaklights
					// fill(20);
					// noStroke();
					// if (this.breaking) {
					//     fill(200, 0, 0);
					// }
					// if (this.acceleration < 0) {
					//     fill(200, 200, 200);
					// }
					
					// rect(-this.carS[0] / 2, this.carS[1] / 5, WS_width / 2, WS_width / 4)
					// rect((this.carS[0] / 2) - (WS_width / 2), this.carS[1] / 5, WS_width / 2, WS_width / 4)
					
					if (this.Selected) {
						noFill()
						stroke(200, 0, 0);
						ellipse(0, 0, 50, 50)
					}
					pop()
				}
			}