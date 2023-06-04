const RoadType = {
  None: Symbol("none"),
  Road: Symbol("road"),
  Gravel: Symbol("gravel")
};

class Road extends Grid {
  constructor(GridWidth, GridHHeight, defaultRoadType=RoadType.None){  
    super(GridWidth, GridHHeight);
    this.fill(defaultRoadType);
    
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




// // Different types of soil.



// constructor(width, height, defaultRoadType=RoadType.None) {
//   super(width, height);
//   this.fill(defaultRoadType);




//     const rockNoiseScale = 0.005;
//     earthGrid.replaceEachXYValue((x, y, value) => {
//       if (value === RoadType.Road) {
//         const v = noise(x * rockNoiseScale * 10, y * rockNoiseScale * 20);
//         if (v > 0.6) {
//           return RoadType.Gravel;
//         }
//         return RoadType.Road;
//       }
//       else {
//         return RoadType.None;
//       }
//     });

//     return earthGrid;
//   }