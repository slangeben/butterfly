let butterflyDevice;
let growBtn;
let video;
let sparkleBg;
let whiteSparkle;

let videoWidth = 300;
let videoHeight = 220;

let rightWing, leftWing;
let butterflies = [];
let grow = false; 
let growTime = 5000; // millisec
let time = 0; 

// TWEEN VARIEBLES
let transitionTime = 1000; //tween y axis
let transitioning = false; 
let transitionStart = 0; //transition start time

function preload() {
  butterflyDevice = loadImage("butterflyDevice.png");
  growBtn = loadImage("growBtn.png");
  rightWing = loadImage("butterflyRightWing.png");
  leftWing = loadImage("butterflyLeftWing.png");
  sparkleBg = loadImage("sparkles.gif")
  whiteSparkle = loadImage("sparklesWhite.gif")
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  imageMode(CENTER);

  // VIDEO
  video = createCapture(VIDEO);
  video.size(videoWidth, videoHeight);
  video.hide();
}

function draw() {
  let currentHour = hour();


  if (currentHour >= 6 && currentHour < 18) {// 6 am - 6pm
  background(255); 
    image(sparkleBg, 0, 0, width, height); 
   } else {
    background(0);
    image(whiteSparkle, 0, 0, width, height); 
   }

  // VIDEO
  push();
  translate(0, 0, 0);
  scale(-1, 1);
  tint(100, 150, 200);
  image(video, 0, 0, videoWidth, videoHeight);
  pop();

// BLOOM EFFECT 
push();
blendMode(ADD);
tint(255, 255); // white
//filter(BLUR, 5);
translate(0, 0, 0);
scale(-1, 1);
image(video, 0, 0, videoWidth, videoHeight); 
pop();




  // BUTTERFLY DEVICE
  translate(0, 0, 50); 
  
  image(butterflyDevice, -15, -50, 900, 800);

  // GROW BUTTON 
  let over = dist(mouseX - width / 2, mouseY - height / 2, 0, 350) < 100;

  //darken on hover event
  push();
  if (over) {
    tint(200);
  }
  if (mouseIsPressed && over) {
    image(growBtn, -20, 350, 220, 110);
  
    if (!grow && butterflies.length === 0 || butterflies[butterflies.length - 1].flapped) {
      grow = true;
      let customTargetY = height / 6.5; // Y POSITION OF TRANSLATION
      let animationDuration = 3000; 
      let newButterfly = new Butterfly(-15, 0, customTargetY, animationDuration);
      butterflies.push(newButterfly); 
    }
  } else {
    image(growBtn, -20, 350, 200, 100);
  }
  
  pop();

  // butterflies
  for (let i = 0; i < butterflies.length; i++) {
    butterflies[i].update();
    butterflies[i].display();
  }
}

class Butterfly {
  constructor(startX, startY, targetY, duration) {
    this.x = startX;
    this.y = startY;
    this.targetY = targetY;
    this.duration = 2000;
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

    this.radiusX = 100; // initial X radius
    this.radiusY = 100; // initial Y radius
    this.radiusGrowthSpeedX = 0.15; // speed at which the X radius increases
    this.radiusGrowthSpeedY = 0.05; // speed at which the Y radius stays constant or grows slightly
  }

  update() {
    let elapsedTime = millis() - this.startGrowthTime;

    // Growing phase
    if (elapsedTime < growTime) {
      this.scaleAmount = map(elapsedTime, 0, growTime, 0, 0.5); // Scale from 0 to 0.5 over growTime
    } else {
      this.scaleAmount = 0.5;
      this.flapping = true;

      // TWEEN for vertical movement
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

    // Increase X and Y radii over time
    this.radiusX += this.radiusGrowthSpeedX; // Stretch X radius
    this.radiusY += this.radiusGrowthSpeedY; // Grow Y radius slightly, or keep constant

    // Set the maximum allowed radius based on the window size
    let maxRadiusX = width / 2 - 150 * this.scaleAmount; // Allow for butterfly's width
    let maxRadiusY = height / 2 - 250 * this.scaleAmount; // Allow for butterfly's height

    // Ensure radius does not exceed the max bounds
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

        // check collisions
        this.checkBounds();

        this.time += 1;
        this.wingAngle = cos(frameCount * 6.5) * PI / 4; // Flap the wings
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
