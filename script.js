/**** SETUP CODE ****/

// Call the init function when the HTML window loads
window.onload = init;

let canvas, ctx;
const gravity = 0.5; // gravity acceleration
const friction = 1; // energy loss on bounce (0 = no bounce, 1 = perfect bounce)
let circles = [];

function init() {
  // Init function that sets up our canvas. 
  canvas = document.getElementById('myCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = 1000;   // bigger canvas width
  canvas.height = 600;   // bigger canvas height

  // Start the first frame request to begin the game loop
  window.requestAnimationFrame(gameLoop);
}

let lastSpawnTime = 0;

/**** OBJECT CREATION FUNCTIONS ****/

// Write the circle object function here
function Circle(x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;
  this.vx = 0;   // horizontal velocity
  this.vy = 0;   // vertical velocity
  this.mass = radius; // mass proportional to size for collision physics
}

Circle.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.fill();
}

Circle.prototype.update = function() {
  // Apply gravity
  this.vy += gravity;

  // Move by velocity
  this.x += this.vx;
  this.y += this.vy;

  // Collide with floor
  if (this.y + this.radius > canvas.height) {
    this.y = canvas.height - this.radius;
    this.vy = -this.vy * friction;

    // Small velocity threshold to stop bouncing
    if (Math.abs(this.vy) < 1) this.vy = 0;
  }

  // Collide with walls (left and right)
  if (this.x - this.radius < 0) {
    this.x = this.radius;
    this.vx = -this.vx * friction;
  } else if (this.x + this.radius > canvas.width) {
    this.x = canvas.width - this.radius;
    this.vx = -this.vx * friction;
  }
}

// Circle-to-circle collision detection and response
function resolveCollision(c1, c2) {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const distance = Math.hypot(dx, dy);
  const minDist = c1.radius + c2.radius;

  if (distance < minDist) {
    // Calculate overlap
    const overlap = (minDist - distance) / 2;

    // Normalize vector between circles
    const nx = dx / distance;
    const ny = dy / distance;

    // Separate circles so they don't overlap
    c1.x -= nx * overlap;
    c1.y -= ny * overlap;
    c2.x += nx * overlap;
    c2.y += ny * overlap;

    // Calculate relative velocity
    const vxRel = c2.vx - c1.vx;
    const vyRel = c2.vy - c1.vy;
    const velAlongNormal = vxRel * nx + vyRel * ny;

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) return;

    // Calculate restitution (elasticity)
    const restitution = friction;

    // Calculate impulse scalar
    const impulse = -(1 + restitution) * velAlongNormal / (1 / c1.mass + 1 / c2.mass);

    // Apply impulse to velocities
    const impulseX = impulse * nx;
    const impulseY = impulse * ny;

    c1.vx -= impulseX / c1.mass;
    c1.vy -= impulseY / c1.mass;
    c2.vx += impulseX / c2.mass;
    c2.vy += impulseY / c2.mass;
  }
}

// Write the createCircle function here. 
function createCircle() {
  const x = randomInteger(50, canvas.width - 50);
  const y = 0; // spawn at top
  const radius = randomInteger(20, 40);
  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
  const color = colors[randomInteger(0, colors.length - 1)];
  return new Circle(x, y, radius, color);
}

// Write the randomInteger function here. 
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**** GAMELOOP ****/

function gameLoop(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Spawn one new circle every 1000ms (1 second)
  if (!lastSpawnTime || timestamp - lastSpawnTime > 1000) {
    circles.push(createCircle());
    lastSpawnTime = timestamp;
  }

  // Update circles
  circles.forEach(circle => {
    circle.update();
  });

  // Resolve collisions between every pair of circles
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      resolveCollision(circles[i], circles[j]);
    }
  }

  // Draw circles
  circles.forEach(circle => {
    circle.draw(ctx);
  });

  // Loop the game
  window.requestAnimationFrame(gameLoop);
}
