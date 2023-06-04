class Car {
    constructor(startx, starty, startDir, genomeSequenceIn) {

        this.GSequence = genomeSequenceIn
        this.carColor = "#"

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

        this.frontAxle = createVector(0, 0)

        this.wrongWay = false; // car starts driving the correct direction

        this.lastCheckpoint = 1;

        this.internalClock = 0;
        this.clockSpeed = .01;

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


        this.turnRadius = this.maxR  //the turn radius becomes the size of the arc the car will follow, 
        //A large arc is a slight turn, a small turn radius becomes a sharp turn. 
        // assigning this to the maxR is essentially infinate radius, so no rotation in either direction. 

        // the current direction tires are turned. 
        this.turnDirection = random(-.1, -1);

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
