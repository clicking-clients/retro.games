<script>
const canvas = document.getElementById('froggerGame');
const ctx = canvas.getContext('2d');
const scale = 20;
const rows = canvas.height / scale; // 24
const cols = canvas.width / scale;  // 48
let paused = false;
let score = 0;
let level = parseInt(document.getElementById('startLevel').value);

const frog = {x: Math.floor(cols/2), y: rows-1, alpha: 1};
const cars = [];
const carRows = [3,5,7,9]; // lanes
const CARS_PER_LANE = 3;
let baseCarSpeed = 0.12; // tiles per frame at level 1 (smaller = slower)
let respawning = false;
let respawnTimerId = null;
let spaceListener = null;
let fadeIntervalId = null;

function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max){ return Math.random() * (max - min) + min; }

function spawnCar(laneIndex){
  const y = carRows[laneIndex];
  const dir = (laneIndex % 2 === 0) ? 1 : -1; // alternate directions per lane
  const len = randInt(2,5); // 2..5 tiles
  const speedMag = baseCarSpeed * level * randFloat(0.8, 1.4);
  const speed = dir * speedMag;
  const startOffset = randInt(0, cols); // random off-screen distance
  let x;
  if(dir > 0){
    x = -startOffset - len; // start left off-screen
  } else {
    x = cols + startOffset; // start right off-screen
  }
  return { x, y, len, speed, dir };
}

function respawnCar(car){
  const gap = randInt(2, 15);   // varied off-screen gap
  car.len = randInt(2,5);       // new random length
  const speedMag = baseCarSpeed * level * randFloat(0.8, 1.4); // new random speed
  car.speed = car.dir * speedMag;
  if(car.dir > 0){
    car.x = -car.len - gap;
  } else {
    car.x = cols + gap;
  }
}

function initCars(){
  cars.length = 0;
  for(let i=0;i<carRows.length;i++){
    for(let k=0;k<CARS_PER_LANE;k++){
      const car = spawnCar(i);
      // Stagger cars within lane for spacing
      const spacing = Math.floor(cols / CARS_PER_LANE) + randInt(2,8);
      if(car.dir > 0){
        car.x -= k * spacing;
      } else {
        car.x += k * spacing;
      }
      cars.push(car);
    }
  }
}

function draw(){
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.scale(scale, scale);

  // frog with alpha for fade-in
  ctx.globalAlpha = frog.alpha;
  ctx.fillStyle = '#0f0';
  ctx.fillRect(frog.x, frog.y, 1, 1);
  ctx.globalAlpha = 1;

  // draw cars (snap to integer tile for crisp pixels)
  ctx.fillStyle = '#f00';
  cars.forEach(car => {
    const baseX = Math.floor(car.x);
    for(let i=0;i<car.len;i++){
      ctx.fillRect(baseX + i, car.y, 1, 1);
    }
  });

  ctx.restore();
  document.getElementById('score').textContent = score;
}

function update(){
  if(paused){ requestAnimationFrame(update); return; }

  if(!respawning){
    // move cars & handle respawn
    cars.forEach(car => {
      car.x += car.speed;
      if(car.dir > 0 && car.x - car.len > cols){
        respawnCar(car);
      } else if(car.dir < 0 && car.x + car.len < 0){
        respawnCar(car);
      }
    });

    // collision check (tile-accurate)
    for(const car of cars){
      const carStart = Math.floor(car.x);
      const carEnd = carStart + car.len; // exclusive
      if(frog.y === car.y && frog.x >= carStart && frog.x < carEnd){
        dramaticHit();
        break;
      }
    }

    // goal reached
    if(frog.y === 0){
      score++;
      frog.y = rows - 1;
      frog.x = Math.floor(cols/2);
    }
  }

  draw();
  requestAnimationFrame(update);
}

function dramaticHit(){
  respawning = true;
  // flashing screen
  let flashes = 0;
  const flashInterval = setInterval(() => {
    ctx.fillStyle = (flashes % 2 === 0) ? '#f00' : '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    flashes++;
    if(flashes > 5){
      clearInterval(flashInterval);
      startRespawnCountdown();
    }
  }, 100);
}

function startRespawnCountdown(){
  // guard so we don't attach multiple listeners/timers
  if(respawnTimerId || spaceListener) return;

  // one-time space listener
  spaceListener = (e) => {
    if(e.code === 'Space'){
      doFadeIn();
    }
  };
  document.addEventListener('keydown', spaceListener);

  // auto after 2 seconds
  respawnTimerId = setTimeout(() => {
    doFadeIn();
  }, 2000);
}

function doFadeIn(){
  // ensure single execution
  if(respawnTimerId){ clearTimeout(respawnTimerId); respawnTimerId = null; }
  if(spaceListener){ document.removeEventListener('keydown', spaceListener); spaceListener = null; }
  fadeInFrog();
}

function fadeInFrog(){
  // reset frog & cars, then fade alpha from 0 -> 1
  frog.x = Math.floor(cols/2);
  frog.y = rows-1;
  frog.alpha = 0;
  score = 0;
  level = parseInt(document.getElementById('startLevel').value);
  initCars();

  if(fadeIntervalId){ clearInterval(fadeIntervalId); }
  fadeIntervalId = setInterval(() => {
    frog.alpha += 0.05;
    if(frog.alpha >= 1){
      frog.alpha = 1;
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
      respawning = false;
    }
  }, 30);
}

function dramaticHit(){
  respawning = true;

  // Explosion at frog position
  const explosion = document.createElement('div');
  explosion.className = 'explosion';
  const pixelSize = canvas.width / cols; // matches your tile size
  explosion.style.width = pixelSize + 'px';
  explosion.style.height = pixelSize + 'px';
  explosion.style.left = (frog.x * pixelSize + canvas.getBoundingClientRect().left) + 'px';
  explosion.style.top = (frog.y * pixelSize + canvas.getBoundingClientRect().top) + 'px';
  document.body.appendChild(explosion);
  setTimeout(() => explosion.remove(), 500);

  // flashing screen
  let flashes = 0;
  const flashInterval = setInterval(() => {
    ctx.fillStyle = (flashes % 2 === 0) ? '#f00' : '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    flashes++;
    if(flashes > 5){
      clearInterval(flashInterval);
      startRespawnCountdown();
    }
  }, 100);
}



document.getElementById('startLevel').addEventListener('change', e => {
  level = parseInt(e.target.value);
  initCars();
});

document.addEventListener('keydown', e => {
  if(respawning) return; // movement disabled while waiting to respawn
  if(e.code==='ArrowLeft' && frog.x>0) frog.x--;
  if(e.code==='ArrowRight' && frog.x<cols-1) frog.x++;
  if(e.code==='ArrowUp' && frog.y>0) frog.y--;
  if(e.code==='ArrowDown' && frog.y<rows-1) frog.y++;
  if(e.code==='KeyP') paused=!paused;
  if(e.code==='KeyR') { respawning=false; resetGame(); }
});

function resetGame(){
  frog.x = Math.floor(cols/2);
  frog.y = rows-1;
  frog.alpha = 1;
  score = 0;
  level = parseInt(document.getElementById('startLevel').value);
  initCars();
}

initCars();
update();
</script>
</body>
</html>
