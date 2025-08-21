<script>
const canvas = document.getElementById('breakoutGame');
const ctx = canvas.getContext('2d');
const scale = 20;
const rows = canvas.height / scale;
const cols = canvas.width / scale;

let score = 0;
let lives = 3;
let level = 1;
let paused = false;
let respawning = false;
const paddleSpeed = 0.5; // faster speed

const paddle = { width: 6, height: 1, x: Math.floor(cols/2 - 3), y: rows - 2 };
const ball = { x: cols/2, y: rows-3, dx: 0.15, dy: -0.15, size: 1 };

const brickRows = 6;
const brickCols = 10;
const bricks = [];
const brickColors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'];

function initBricks() {
  bricks.length = 0;
  for (let r = 0; r < brickRows; r++) {
    for (let c = 0; c < brickCols; c++) {
      bricks.push({ 
        x: 2 + c * 4, 
        y: 2 + r * 2, 
        w: 3, 
        h: 1, 
        alive: true, 
        color: brickColors[r % brickColors.length] 
      });
    }
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.scale(scale, scale);

  // Paddle
  ctx.fillStyle = '#0f0';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Ball
  ctx.fillStyle = '#ff0';
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);

  // Bricks
  bricks.forEach(b => {
    if (b.alive) {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  });

  ctx.restore();
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('level').textContent = level;
}

function update() {
  if (paused || respawning) { requestAnimationFrame(update); return; }

 updatePaddle(); // <-- smooth paddle movement

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collisions
  if (ball.x < 0 || ball.x + ball.size > cols) ball.dx *= -1;
  if (ball.y < 0) ball.dy *= -1;

  // Paddle collision
  if (ball.y + ball.size >= paddle.y && ball.x + ball.size >= paddle.x && ball.x <= paddle.x + paddle.width) {
    ball.dy *= -1;
    let hitPos = (ball.x - paddle.x) / paddle.width - 0.5;
    ball.dx = hitPos * 0.4;
  }

  // Brick collisions
  bricks.forEach(b => {
    if (b.alive &&
        ball.x < b.x + b.w &&
        ball.x + ball.size > b.x &&
        ball.y < b.y + b.h &&
        ball.y + ball.size > b.y) {
      b.alive = false;
      ball.dy *= -1;
      score += 10;
    }
  });

  // Check level complete
  if (bricks.every(b => !b.alive)) {
    level++;
    ball.dx *= 1.15;
    ball.dy *= 1.15;
    initBricks();
    resetBall();
  }

  // Missed ball
  if (ball.y > rows) {
    loseLife();
  }

  draw();
  requestAnimationFrame(update);
}

function loseLife() {
  lives--;
  if (lives <= 0) {
    resetGame();
    return;
  }
  respawning = true;
  createExplosion(ball.x, ball.y);
  setTimeout(() => {
    resetBall();
    respawning = false;
  }, 1000);
}

function resetBall() {
  ball.x = cols/2; 
  ball.y = rows-3;
  ball.dy = -Math.abs(ball.dy);
}

// Paddle control
let paddleVel = 0;

// Keyboard input
const keys = { left: false, right: false };
document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'KeyP') paused = !paused;
  if (e.code === 'KeyR') resetGame();
});
document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'ArrowRight') keys.right = false;
});

// Mouse control
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / scale;
  paddle.x = Math.min(Math.max(mouseX - paddle.width/2, 0), cols - paddle.width);
});

function updatePaddle() {
  // Smooth keyboard movement
  if (keys.left) paddleVel = -paddleSpeed;
  else if (keys.right) paddleVel = paddleSpeed;
  else paddleVel = 0;

  paddle.x += paddleVel;

  // Boundaries
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > cols) paddle.x = cols - paddle.width;
}

function createExplosion(x, y) {
  const pixelSize = canvas.width / cols;
  const explosion = document.createElement('div');
  explosion.className = 'explosion';
  explosion.style.width = pixelSize + 'px';
  explosion.style.height = pixelSize + 'px';
  explosion.style.left = (x * pixelSize + canvas.getBoundingClientRect().left) + 'px';
  explosion.style.top = (y * pixelSize + canvas.getBoundingClientRect().top) + 'px';
  document.body.appendChild(explosion);
  setTimeout(() => explosion.remove(), 500);
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  ball.dx = 0.15; ball.dy = -0.15;
  paddle.x = Math.floor(cols/2 - 3);
  initBricks();
  resetBall();
}

initBricks();
draw();
update();
</script>
</body>
</html>
