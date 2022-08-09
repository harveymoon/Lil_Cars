class Car {
    constructor(startx, starty, startDir) {
        this.rearAxle = createVector(startx, starty);

        // Angle of car
        this.carTheta = startDir;

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
        this.maxR = 2000 * carScale; // Max turning radius
        this.minR = this.carS[1] * 1.2; // Min turning radius

        // Car speeds
        this.speed = 0;
        this.maxSpeed = 1000 * carScale; // Higher is faster
        this.turnSpeed = 20 * carScale; // Lower is faster

        // Initial turning radius set to maxR so wheels straight
        // turnRadius = maxR
        this.turnRadius = this.minR + 50;
        // let trailerRadius = 0;

        this.corX = this.rearAxle.x + this.turnRadius * cos(this.carTheta);
        this.corY = this.rearAxle.y - this.turnRadius * sin(this.carTheta);

        let tcorX = this.corX;
        let tcorY = this.corY - this.carS[1];

        this.diffTheta = 0;
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
        if (sign(this.turnRadius) == 1) {
            this.turnRadius += 3 * abs(this.turnRadius / this.turnSpeed);
        }

        if ((sign(this.turnRadius) == -1) & (this.turnRadius < -this.minR)) {
            this.turnRadius += 3 * abs(this.turnRadius / this.turnSpeed);
        }

        if (this.turnRadius > this.maxR) {
            this.turnRadius = -this.maxR;
        }
        this.corX = this.rearAxle.x + this.turnRadius * cos(this.carTheta);
        this.corY = this.rearAxle.y - this.turnRadius * sin(this.carTheta);
    }

    turnRight() {
        if (sign(this.turnRadius) == -1) {
            this.turnRadius -= 3 * abs(this.turnRadius / this.turnSpeed);
        }

        if ((sign(this.turnRadius) == 1) & (this.turnRadius > this.minR)) {
            this.turnRadius -= 3 * abs(this.turnRadius / this.turnSpeed);
        }

        if (this.turnRadius < -this.maxR) {
            this.turnRadius = this.maxR;
        }
        this.corX = this.rearAxle.x + this.turnRadius * cos(this.carTheta);
        this.corY = this.rearAxle.y - this.turnRadius * sin(this.carTheta);
    }

    break() {
        if (abs(this.acceleration) >= 0) {
            this.acceleration -= this.acceleration * 0.08;
        }
        this.breaking = true;
    }

    update() {
        if (abs(this.diffTheta) < 0.835) {
            if (this.speed > 0) {
                this.carTheta -=
                    (0.01 * sign(this.turnRadius)) / abs(this.turnRadius / this.speed);
            } else {
                this.carTheta +=
                    (0.01 * sign(this.turnRadius)) / abs(this.turnRadius / this.speed);
            }
            this.rearAxle.x = this.corX - this.turnRadius * cos(this.carTheta);
            this.rearAxle.y = this.corY + this.turnRadius * sin(this.carTheta);
        }

        if (this.acceleration != 0) {
            this.acceleration -= this.acceleration * 0.01;
        }

        if (this.acceleration > 1) {
            this.acceleration = 1;
        } else if (this.acceleration < -1) {
            this.acceleration = -1;
        }

        this.speed = this.maxSpeed * this.acceleration;
        // console.log(this.speed)
        // Distances to front and rear tire from center rear axle
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
        // an angle based on the size of the car?

        // console.log(frontTh)

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
            this.leftTheta = atan2(this.corY - frontLy, this.corX - frontLx);
            this.rightTheta = atan2(this.corY - frontRy, this.corX - frontRx);
        } else {
            this.leftTheta = -this.carTheta;
            this.rightTheta = -this.carTheta;
        }


        let frontCx = this.rearAxle.x + frontD * cos(frontTh + this.carTheta);
        let frontCy = this.rearAxle.y - frontD * sin(frontTh + this.carTheta);


        let frontDir = 4.72;
        let ahead1x = this.rearAxle.x + ((frontD * 1.2) * cos(this.carTheta - frontDir));
        let ahdad1y = this.rearAxle.y - ((frontD * 1.2) * sin(this.carTheta - frontDir));

        // if (gridLookup(ahead1x, ahdad1y) == false) {
        //     fill(0)
        // } else {
        //     fill(200)
        // }
        // ellipse(ahead1x, ahdad1y, 10, 10)
        testPoint(ahead1x, ahdad1y)

        let ahead1Rx = this.rearAxle.x + ((frontD * 2) * cos(frontTh + this.carTheta));
        let ahead1Ry = this.rearAxle.y - ((frontD * 2) * sin(frontTh + this.carTheta));
        testPoint(ahead1Rx, ahead1Ry)

        let ahead1Lx = this.rearAxle.x - ((frontD * 2) * cos(frontTh - this.carTheta));
        let ahead1Ly = this.rearAxle.y - ((frontD * 2) * sin(frontTh - this.carTheta));
        testPoint(ahead1Lx, ahead1Ly);

        let sideLx = this.rearAxle.x - ((frontD * 1.3) * cos(this.carTheta-.4));
        let sideLy = this.rearAxle.y + ((frontD * 1.3) * sin(this.carTheta-.4));
        testPoint(sideLx, sideLy);

        let sideRx = this.rearAxle.x + ((frontD * 1.3) * cos(this.carTheta+.4));
        let sideRy = this.rearAxle.y - ((frontD * 1.3) * sin(this.carTheta+.4));
        testPoint(sideRx, sideRy);


        let ahead2Rx = this.rearAxle.x + ((frontD * 3) * cos(frontTh +this.carTheta- .15));
        let ahdad2Ry = this.rearAxle.y - ((frontD * 3) * sin(frontTh+ this.carTheta- .15));
        testPoint(ahead2Rx, ahdad2Ry);

        let ahead2Lx = this.rearAxle.x - ((frontD * 3) * cos(frontTh -this.carTheta - .15));
        let ahdad2Ly = this.rearAxle.y - ((frontD * 3) * sin(frontTh - this.carTheta- .15));
        testPoint(ahead2Lx, ahdad2Ly);



        let ahead2x = this.rearAxle.x + ((frontD * 3.2) * cos(this.carTheta - frontDir));
        let ahdad2y = this.rearAxle.y - ((frontD * 3.2) * sin(this.carTheta - frontDir));
        testPoint(ahead2x, ahdad2y);


        let ahead3x = this.rearAxle.x + ((frontD * 4.5) * cos(this.carTheta - frontDir));
        let ahdad3y = this.rearAxle.y - ((frontD * 4.5) * sin(this.carTheta - frontDir));
        testPoint(ahead3x, ahdad3y);

        let behindDir = 1.6;

        let behind1x = this.rearAxle.x + ((frontD * 1.2) * cos(this.carTheta - behindDir));
        let behind1y = this.rearAxle.y - ((frontD * 1.2) * sin(this.carTheta - behindDir));
        testPoint(behind1x, behind1y);


        // Draw front tires
        fill(0);
        rectAngle(
            frontLx,
            frontLy,
            this.tireW,
            this.tireH,
            this.tireH / 2,
            -this.leftTheta
        );
        rectAngle(
            frontRx,
            frontRy,
            this.tireW,
            this.tireH,
            this.tireH / 2,
            -this.rightTheta
        );

        // Draw rear tires
        rectAngle(
            rearLx,
            rearLy,
            this.tireW,
            this.tireH,
            this.tireH / 2,
            this.carTheta
        );
        rectAngle(
            rearRx,
            rearRy,
            this.tireW,
            this.tireH,
            this.tireH / 2,
            this.carTheta
        );

        // Draw the car
        stroke(1);
        strokeWeight(1);
        // fill(130,130,250)
        // fill(130,250, 130)
        fill(250, 100, 100);

        push()
        translate(this.rearAxle.x, this.rearAxle.y);
        rotate(-this.carTheta)
        rect(-this.carS[0] / 2, 8 - this.carS[1], this.carS[0], this.carS[1])
        pop()

        let frontBumper = createVector(0, this.carS[1]);
        frontBumper.add(this.rearAxle)


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
        fill(240, 240, 240);
        noStroke();

        // Windshields
        rectAngle(
            this.rearAxle.x,
            this.rearAxle.y,
            (4 * this.carS[0]) / 5,
            0.15 * this.carS[1],
            (-47 * this.carS[1]) / 100,
            this.carTheta
        );
        rectAngle(
            this.rearAxle.x,
            this.rearAxle.y,
            (4 * this.carS[0]) / 5,
            0.13 * this.carS[1],
            (-5 * this.carS[1]) / 100,
            this.carTheta
        );

        let rearB = this.carS[0] * 0.25;
        let rearBLx = this.rearAxle.x - rearB * cos(this.carTheta);
        let rearBLy = this.rearAxle.y + rearB * sin(this.carTheta);
        let rearBRx = this.rearAxle.x + rearB * cos(this.carTheta);
        let rearBRy = this.rearAxle.y - rearB * sin(this.carTheta);

        fill(20);
        if (this.breaking) {
            fill(200, 0, 0);
        }

        rectAngle(
            rearBLx,
            rearBLy,
            this.tireW,
            this.carS[1] * 0.1,
            this.carS[1] * 0.1,
            this.carTheta
        );
        rectAngle(
            rearBRx,
            rearBRy,
            this.tireW,
            this.carS[1] * 0.1,
            this.carS[1] * 0.1,
            this.carTheta
        );

        this.breaking = false;
    }
}
