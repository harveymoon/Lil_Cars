class Road{
    constructor(){

        let numPoints = 10;
        let angEach = TWO_PI/numPoints;

        this.Checkpoints = [];

        this.roadImg = createGraphics(width/2, height/2);

        for (let index = 0; index < numPoints; index++) {
            let radius = random(100,width*.2);
           let xPos = sin(angEach*index)*radius;
           let yPos = cos(angEach*index)*radius;
           let vecN = createVector(xPos, yPos);
           vecN.add(width/4,height/4)
           this.Checkpoints.push(vecN);
            
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
        image( this.roadImg,0,0, width, height)
    }

}

// Different types of soil.
const SoilType = {
    None: Symbol("none"),
    Soft: Symbol("soft"),
    Hard: Symbol("hard")
  };
  
  // A grid representing types of earth (soft soil, rock etc).
  class Earth extends Grid {
    constructor(width, height, defaultSoilType=SoilType.None) {
      super(width, height);
      this.fill(defaultSoilType);
    }
  }
  
  function generateEarth(width, height) {
    noiseSeed(Math.random() * 10000);
    const earthGrid = new Earth(width, height);
    const earthNoiseScale1 = 0.001;
    const earthNoiseScale2 = 0.05;
    earthGrid.fill(SoilType.None);
    for (let x = 0; x < earthGrid.width; x++){
      const v = int(noise(x * earthNoiseScale1) * earthGrid.height * 0.5);
      const v2 = int(noise(x * earthNoiseScale2) * 20);
      for (let y = earthGrid.height * 0.3 + v + v2; y < earthGrid.height; y++){
        earthGrid.set(x, y, SoilType.Soft);
      }
    }
  
    const rockNoiseScale = 0.005;
    earthGrid.replaceEachXYValue((x, y, value) => {
      if (value === SoilType.Soft) {
        const v = noise(x * rockNoiseScale * 10, y * rockNoiseScale * 20);
        if (v > 0.6) {
          return SoilType.Hard;
        }
        return SoilType.Soft;
      }
      else {
        return SoilType.None;
      }
    });
  
    return earthGrid;
  }