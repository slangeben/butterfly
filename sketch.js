let butterflyDevice;
let growBtn;
let video;
let sparkleBg;
let whiteSparkle;
let font;
let currentMode = "day"; // Default mode

let videoWidth = 300;
let videoHeight = 220;

let rightWing, leftWing;
let butterflies = [];
let grow = false; 
let growTime = 5000; // millisec
let time = 0; 

// TWEEN VARIABLES
let transitionTime = 1000; //tween y axis
let transitioning = false; 
let transitionStart = 0; //transition start time

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
  createCanvas(windowWidth, windowHeight, WEBGL);
  imageMode(CENTER);

  // VIDEO
  video = createCapture(VIDEO);
  video.size(videoWidth, videoHeight);
  video.hide();
}

function draw() {
  let currentHour = hour();

  // Adjust based on the 'currentMode' variable, which switches between "day" and "night"
  if (currentMode === "day") {
    background(255); // White background during the day
    image(sparkleBg, 0, 0, width, height); // Day sparkle background
  } else if (currentMode === "night") {
    background(0); // Black background at night
    image(whiteSparkle, 0, 0, width, height); // Night sparkle background
  } else if (currentHour >= 6 && currentHour < 18) {
    // Default to day mode if no key press and it's day time
    currentMode = "day";
    background(255);
    image(sparkleBg, 0, 0, width, height);
  } else {
    // Default to night mode if no key press and it's night time
    currentMode = "night";
    background(0);
    image(whiteSparkle, 0, 0, width, height);
  }
  push();
  textSize(15);
  if (currentMode === "day") {
    fill(0); // Black text for day mode
  } else if (currentMode === "night") {
    fill(255); // White text for night mode
  }
  
  textFont(font);
  textAlign(CENTER);
  
  // Text display with proper positioning
  text("press 'D' for day, and 'N' for night", -15, 440);
  text("BUTTERFLY - IRL TO URL", -10, -420); // Adjust vertical positioning for clarity
  text("click button to make the butterfly grow in your world (irl)", -10, -390);
  text("then watch it expand to digital (url)", -10, -370);
  pop();

  
  
  
  // Video feed
  push();
  translate(0, 30, 0);
  scale(-1, 1);
  tint(100, 150, 200);
  image(video, 0, 0, videoWidth, videoHeight);
  pop();

  // Bloom effect
  push();
  blendMode(ADD);
  tint(255, 255); // White glow
  translate(0, 30, 0);
  scale(-1, 1);
  image(video, 0, 0, videoWidth, videoHeight); 
  pop();

  // Butterfly device
  translate(0, 30, 50); 
  image(butterflyDevice, -15, -50, 900, 800);

  // Grow button hover and interaction
  let over = dist(mouseX - width / 2, mouseY - height / 2, 0, 350) < 100;
  push();
  if (over) {
    tint(200);
  }
  if (mouseIsPressed && over) {
    image(growBtn, -20, 300, 220, 110);
    if (!grow && butterflies.length === 0 || butterflies[butterflies.length - 1].flapped) {
      grow = true;
      let customTargetY = height / 8.5; // Y POSITION OF TRANSLATION, move
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

    // Growing phase
    if (elapsedTime < growTime) {
      this.scaleAmount = map(elapsedTime, 0, growTime, 0, 0.5); 
    } else {
      this.scaleAmount = 0.5;
      this.flapping = true;

      // Transition phase
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
