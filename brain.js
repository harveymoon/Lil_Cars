

class ABrain {
    constructor(brainGenes) {
        
        this.viewBrain = true;
        
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
        
        //// unused actions:
        //		this.Act_SetRootRange,
        ///
        
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
        if (debugBrain) console.log("connection trigger : " + sensVal);
        
        if (this.sink_type == 1) {
            // is an external action
            this.actions[this.sink_id](sensVal, agentObj);
        } else {
            // sink to internal neuron value
            let cval = agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length];  // current value in the internal neuron
            let setTo = Math.tanh((cval + sensVal));//does a tanh function for some reason idk why
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



