let butterflyDevice;
let growBtn;
let video;
let sparkleBg;
let whiteSparkle;
let font;
let currentMode = "day";

let videoWidth = 300;
let videoHeight = 220;

let rightWing, leftWing;
let butterflies = [];
let grow = false; 
let growTime = 5000; // millisec
let time = 0; 

// TWEEN VARIABLES
let transitionTime = 1000; //y axis tween
let transitioning = false; 
let transitionStart = 0; //start time

let tinkerbell = [];

function preload() {
  butterflyDevice = loadImage("butterflyDevice.png");
  growBtn = loadImage("growBtn.png");
  rightWing = loadImage("butterflyRightWing.png");
  leftWing = loadImage("butterflyLeftWing.png");
  sparkleBg = loadImage("sparkles.gif");
  whiteSparkle = loadImage("sparklesWhite.gif");

  font = loadFont("CourierPrime-Regular.ttf");
}

function setup() {
  //pixelDensity(1); // Fix zoom on high-DPI devices like iPad
  let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  let ctx = cnv.canvas.getContext("webgl2", { willReadFrequently: true });
  imageMode(CENTER);

  // VIDEO
  video = createCapture(VIDEO);
  video.size(videoWidth, videoHeight);
  video.hide();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  let currentHour = hour();

  //DYNAMIC DAY AND NIGHT MODE
  if (currentMode === "day") {
    background(255); 
    image(sparkleBg, 0, 0, width, height); 
  } else if (currentMode === "night") {
    background(0);
    image(whiteSparkle, 0, 0, width, height); 
  } else if (currentHour >= 6 && currentHour < 18) {
    
    currentMode = "day";
    background(255);
    image(sparkleBg, 0, 0, width, height);
  } else {
    
    currentMode = "night";
    background(0);
    image(whiteSparkle, 0, 0, width, height);
  }
  push();
  textSize(15);
  if (currentMode === "day") {
    fill(0); 
  } else if (currentMode === "night") {
    fill(255); 
  }
  
  textFont(font);
  textAlign(CENTER);
  
 // INFO TEXT
  text("press 'D' for day, and 'N' for night", -15, 440);
  text("BUTTERFLY - IRL TO URL", -10, -420); 
  text("click button to make the butterfly grow in your world (irl)", -10, -390);
  text("then watch it expand into the digital (url)", -10, -370);
  pop();

  
  
  
  // Video feed
  push();
  translate(0, 30, 0);
  scale(-1, 1);
  tint(100, 150, 200);
  image(video, 0, 0, videoWidth, videoHeight);
  pop();

  // BLOOM EFFECT
  push();
  blendMode(ADD);
  tint(255, 255); // glow
  translate(0, 30, 0);
  scale(-1, 1);
  image(video, 0, 0, videoWidth, videoHeight); 
  pop();

  // butterfly device
  translate(0, 30, 50); 
  image(butterflyDevice, -15, -50, 900, 800);

  // BUTTON
  let over = dist(mouseX - width / 2, mouseY - height / 2, 0, 350) < 100;
  push();
  if (over) {
    tint(200);
  }
  if (mouseIsPressed && over) {
    image(growBtn, -20, 300, 220, 110);
    if (!grow && butterflies.length === 0 || butterflies[butterflies.length - 1].flapped) {
      grow = true;
      let customTargetY = height / 8.5; // Y POSITION OF TRANSLATION
      let animationDuration = 3000; 
      let newButterfly = new Butterfly(-15, 5, customTargetY, animationDuration);
      butterflies.push(newButterfly); 
    }
  } else {
    image(growBtn, -20, 300, 200, 100);
  }
  pop();

  // butterflies
  for (let i = butterflies.length - 1; i >= 0; i--) {
    butterflies[i].update();
    butterflies[i].display();
  }
}


function keyPressed() {
  console.log("key pressed:", key); 

  if (key === "D" || key === "d") {
    currentMode = "day";
  } else if (key === "N" || key === "n") {
    currentMode = "night";
  }
}

function touchStarted() {
  let over = dist(touchX - width / 2, touchY - height / 2, 0, 350) < 100;

  if (!over) {
    // toggle day/night mode only if not touching grow button
    if (currentMode === "day") {
      currentMode = "night";
    } else {
      currentMode = "day";
    }
  }
  return false; // prevent default
}

class Butterfly {
  constructor(startX, startY, targetY, duration) {
    this.x = startX;
    this.y = startY;
    this.targetY = targetY;
    this.duration = duration;
    this.startGrowthTime = millis();
    this.scaleAmount = 0;
    this.flapping = false;
    this.flapped = false;
    this.wingAngle = 0;
    this.time = 0;
    this.transitioning = false;
    this.transitionComplete = false;
    this.transitionStart = 0;
    this.flapDelay = 0;
    this.flapStartTime = 0;

    this.radiusX = 100; 
    this.radiusY = 100; 
    this.radiusGrowthSpeedX = 0.15; 
    this.radiusGrowthSpeedY = 0.05; 
  }

  update() {
    let elapsedTime = millis() - this.startGrowthTime;

    // growing
    if (elapsedTime < growTime) {
      this.scaleAmount = map(elapsedTime, 0, growTime, 0, 0.5); 
    } else {
      this.scaleAmount = 0.5;
      this.flapping = true;

      // TWEEN y-axis
      if (!this.transitioning && !this.transitionComplete) {
        this.transitionStart = millis();
        this.transitioning = true;
      }

      if (this.transitioning) {
        let transitionElapsed = millis() - this.transitionStart;
        if (transitionElapsed < this.duration) {
          this.y = map(transitionElapsed, 0, this.duration, this.y, this.targetY);
        } else {
          this.y = this.targetY;
          this.transitioning = false;
          this.transitionComplete = true;
        }
      }
    }

    // increase x and y
    this.radiusX += this.radiusGrowthSpeedX;
    this.radiusY += this.radiusGrowthSpeedY;

    let maxRadiusX = width / 2 - 150 * this.scaleAmount;
    let maxRadiusY = height / 2 - 250 * this.scaleAmount;

    this.radiusX = min(this.radiusX, maxRadiusX);
    this.radiusY = min(this.radiusY, maxRadiusY);

    // FLAP DELAY
    if (elapsedTime > growTime && !this.flapStartTime) {
      this.flapStartTime = millis();
    }

    if (this.flapping && this.transitionComplete) {
      let flapElapsed = millis() - this.flapStartTime;
      if (flapElapsed >= this.flapDelay) {
        this.x = sin(this.time * 0.01) * this.radiusX;
        this.y = cos(this.time * 0.01) * this.radiusY;
        this.checkBounds();
        this.time += 1;
        this.wingAngle = cos(frameCount * 6.5) * PI / 4; 
      }
    }

    if (elapsedTime > growTime && !this.flapped) {
      this.flapped = true;
    }
  }

  checkBounds() {
    let halfWidth = 150 * this.scaleAmount;
    let halfHeight = 250 * this.scaleAmount;

    if (this.x + halfWidth > width / 2) {
      this.x = width / 2 - halfWidth;
    } else if (this.x - halfWidth < -width / 2) {
      this.x = -width / 2 + halfWidth;
    }

    if (this.y + halfHeight > height / 2) {
      this.y = height / 2 - halfHeight;
    } else if (this.y - halfHeight < -height / 2) {
      this.y = -height / 2 + halfHeight;
    }
  }

  display() {
    push();
    translate(this.x, this.y, 0);
    scale(this.scaleAmount);

    // LEFT WING
    push();
    translate(0, 0, 100);
    rotateY(this.wingAngle);
    image(leftWing, -80, 0, 150, 250);
    pop();

    // RIGHT WING
    push();
    translate(0, 0, 100);
    rotateY(-this.wingAngle);
    image(rightWing, 70, 0, 150, 250);
    pop();

    pop();
  }
}

/*
IMPORTANT: Add this in your HTML <head> section to prevent zooming on iPad and mobiles:

<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

*/
