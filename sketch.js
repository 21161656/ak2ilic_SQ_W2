// ============================================================
// Week 2 Example 2: Platformer with Platforms Array
// ============================================================

let playerImg;
let platformImg;
let backgroundImg;
let lavaY = 500; // New mechanic I added for challenge and stress like the original game.
// Strawberry: AKA THE GOAL OF THE GAME, for which you have to reach to win.
let strawberry = {
  x: 700,
  y: 40,
  size: 30
};

function preload() {
  playerImg = loadImage("assets/images/celeste character.png");
  backgroundImg = loadImage("assets/images/Celeste Background.png");
}

let platforms = [
  // { x, y, w, h }
  { x: 0,   y: 410, w: 800, h: 40 }, // ground (full width floor)
  { x: 80,  y: 310, w: 120, h: 16, type: "moving", startX: 80, speed: 0.5, range: 100, direction: 1 }, // moving left low platform
  { x: 280, y: 240, w: 140, h: 16, type: "moving", startX: 280, speed: 2, range: 120, direction: 1 }, // moving center platform
  { x: 500, y: 170, w: 120, h: 16, type: "moving", startX: 500, speed: 1, range: 100, direction: 1 }, // moving right high platform
  { x: 160, y: 150, w: 100, h: 16, type: "moving", startX: 160, speed: 1, range: 100, direction: 1 }, // moving left high platform
  { x: 360, y: 320, w: 110, h: 16, type: "moving", startX: 360, speed: 0.5, range: 100, direction: 1 }, // moving centre low platform
  { x: 620, y: 290, w: 130, h: 16, type: "moving", startX: 620, speed: 0.5, range: 100, direction: 1 }, // moving far right platform
];


// PLAYER OBJECT — same structure as Example 1
// w and h are added here for use in collision detection.

let player = {
  x: 100,
  y: 100,

  vx: 0, // horizontal velocity
  vy: 0, // vertical velocity

  r: 20, // visual radius for blob drawing and collision

  // Movement tuning — change these to adjust how the game feels
  speed: 0.55,    // horizontal acceleration per frame
  maxSpeed: 4.5,  // maximum horizontal speed
  jumpForce: -12, // upward velocity applied when jumping (negative = upward)
  friction: 0.78, // horizontal slowdown when no key is pressed (0–1, lower = more friction)

  onGround: false, // tracks whether the player is standing on something
};


// PHYSICS CONSTANTS
// Defined outside the player object so they can be shared
// across multiple objects (e.g. enemies)

const GRAVITY = 0.6; // downward force added to vy every frame

// Blob animation time — increases each frame to animate the wobble
let blobT = 0;

// Platform colour stored as an array so it can be reused easily
const PLATFORM_COLOR = [255, 160, 50]; // warm orange


// setup()
// Runs once at the very start of the sketch.
// Sets up the canvas and positions the player on the ground.

function setup() {
  createCanvas(800, 450);

  // Place player on top of the ground platform (index 0 in the array)
  player.y = platforms[0].y - player.r;
}

// ============================================================
// draw()
// Runs repeatedly in a loop after setup() finishes.
// Each frame we clear the background, handle input,
// apply physics, resolve collisions, and draw everything.
// ============================================================
function draw() {
image(backgroundImg, 0, 0, width, height);
drawLava(); // I have to put this after the background so it shows. 

  handleInput();
  applyPhysics();
  movePlatforms(); // idea helped by chatgpt 
  resolvePlatformCollisions();

  drawPlatforms();
  drawPlayer();
  drawHUD();
  drawStrawberry();

  blobT += 0.015; // advance blob wobble animation each frame
  lavaY -= 0.3; // Lava rises slowly over time, creating a sense of urgency


  // The winning condition. 
  let d = dist(player.x, player.y, strawberry.x, strawberry.y);

if (d < 30) {
  fill(255);
  textSize(40);
  textAlign(CENTER);
  text("YOU WIN!", width / 2, height / 2);

  noLoop();
}
}

// ------------------------------------------------------------
// handleInput()
// Checks which keys are held down this frame and updates
// the player's velocity accordingly.
// keyIsDown() returns true as long as the key is held —
// unlike keyPressed(), which only fires once per press.
// We check both arrow keys and WASD so either works.
// ------------------------------------------------------------
function handleInput() {
  // --- Horizontal movement ---
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // LEFT or A
    player.vx -= player.speed;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // RIGHT or D
    player.vx += player.speed;
  }

  // --- Clamp horizontal speed ---
  // constrain(value, min, max) keeps a value within a range.
  // Without this, holding a key forever would accelerate infinitely.
  player.vx = constrain(player.vx, -player.maxSpeed, player.maxSpeed);

  // --- Apply friction when no horizontal key is pressed ---
  // Multiplying by a value less than 1 gradually slows the player down.
  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(65) &&
    !keyIsDown(RIGHT_ARROW) &&
    !keyIsDown(68)
  ) {
    player.vx *= player.friction;
  }

  // --- Jump ---
  // The player can only jump when standing on the ground (onGround = true).
  // This prevents jumping again mid-air.
  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && player.onGround) { // UP or W
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

// ------------------------------------------------------------
// applyPhysics()
// Each frame we:
//   1. Add gravity to vertical velocity (vy)
//   2. Move the player by its velocity (vx, vy)
//   3. Reset onGround so collision can set it again
//   4. Handle falling off the bottom of the canvas
// ------------------------------------------------------------
function applyPhysics() {
  // 1. Apply gravity — pulls the player down every frame
  player.vy += GRAVITY;

  // 2. Move player by its current velocity
  player.x += player.vx;
  player.y += player.vy;

  // 3. Keep player inside canvas horizontally
  player.x = constrain(player.x, player.r, width - player.r);

  // 4. If player falls below the canvas, reset to start position
  if (player.y > height + 100) {
    player.x = 100;
    player.y = platforms[0].y - player.r;
    player.vx = 0;
    player.vy = 0;
  }

  // Game loop if player touches lava the game resets similar to the original.
  if (player.y + player.r > lavaY) {
  player.x = 100;
  player.y = platforms[0].y - player.r;

  player.vx = 0;
  player.vy = 0;

  lavaY = 500;
}

  // Assume in the air until collision check says otherwise
  player.onGround = false;
}

// ------------------------------------------------------------
// resolvePlatformCollisions()
// Loops through every platform and checks if the player
// is landing on top of it.
//
// The collision check asks three questions:
//   1. Is the player horizontally overlapping the platform?
//   2. Is the player falling downward (vy >= 0)?
//   3. Is the player's bottom at or below the platform top?
//
// If all three are true, we snap the player to sit on top.
// This top-only check means the player can jump through
// platforms from below, which is a common platformer pattern.
// ------------------------------------------------------------
function resolvePlatformCollisions() {
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    // Player's bounding box edges
    let playerLeft   = player.x - player.r;
    let playerRight  = player.x + player.r;
    let playerBottom = player.y + player.r;

    // Platform edges
    let platLeft  = p.x;
    let platRight = p.x + p.w;
    let platTop   = p.y;

    // 1. Check horizontal overlap
    let overlapsHorizontally = playerRight > platLeft && playerLeft < platRight;

    // 2 & 3. Check if landing on top (falling down onto the platform surface)
    // The small tolerance (+ 20) prevents the player clipping through
    // fast-moving platforms or getting stuck on edges.
    let landingOnTop =
      player.vy >= 0 &&
      playerBottom >= platTop &&
      playerBottom <= platTop + 20;

    if (overlapsHorizontally && landingOnTop) {
      player.y = platTop - player.r; // snap to platform surface
      player.vy = 0;                 // stop falling
      player.onGround = true;        // allow jumping again
    }
  }
}

// ------------------------------------------------------------
// drawPlatforms()
// Loops through the platforms array and draws each one.
// This is the same loop pattern used to draw any collection
// of objects — enemies, coins, tiles, etc.
// ------------------------------------------------------------
function drawPlatforms() {
  fill(PLATFORM_COLOR[0], PLATFORM_COLOR[1], PLATFORM_COLOR[2]);
  noStroke();

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];
    rect(p.x, p.y, p.w, p.h, 6); // rounded corners
  }
}

// ------------------------------------------------------------
// drawPlayer()
// The blob is drawn as a polygon using noise() to offset
// each vertex slightly, creating an organic wobble effect.
// push() and pop() save and restore drawing settings so
// styles set here don't affect other drawing functions.
// ------------------------------------------------------------
function drawPlayer() {
  push();
  imageMode(CENTER);
  image(playerImg, player.x, player.y, player.r * 3, player.r * 3);
  pop();
}

// ------------------------------------------------------------
// drawHUD()
// HUD = Heads Up Display.
// Shows controls on screen so the player always knows
// how to interact without needing external instructions.
// ------------------------------------------------------------
function drawHUD() {
  fill(180);
  noStroke();
  textSize(13);
  textAlign(LEFT);
  text("Move: Arrow Keys or WASD   Jump: W or Up Arrow", 16, 24);
}

function movePlatforms() {
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    if (p.type === "moving") {
      p.x += p.speed * p.direction;

      if (p.x > p.startX + p.range || p.x < p.startX - p.range) {
        p.direction *= -1;
      }
    }
  }
}

// function for drawing the actual lava 
function drawLava() {
  fill(255, 80, 0);

  rect(0, lavaY, width, height - lavaY);
}

// Draw the straberry because images are too much of a hassle, but I remember there was fruit in the game.
function drawStrawberry() {
  fill(255, 0, 80);
  ellipse(strawberry.x, strawberry.y, strawberry.size);

  fill(0, 200, 0);
  rect(strawberry.x - 3, strawberry.y - 20, 6, 10);
}