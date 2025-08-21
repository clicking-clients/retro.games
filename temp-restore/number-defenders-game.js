<script>
(() => {
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W = canvas.width, H = canvas.height;
let lanes = 4, playerLane = 0; // Start in leftmost lane
let laneW = W/lanes, floorY = H-48;

let score=0, lives=3, running=true, gameOver=false;
let speedValue=parseFloat(document.getElementById('speedSlider').value)/4;
let words=[], wordsLeft=0, totalWordsInLevel=20, spawnedCount=0;
let rocketLaunched=false, lastOutcomeSuccess=false;
let startTime, timerDuration=180;
let level=1, maxOperand=20;

const speedSlider=document.getElementById('speedSlider');
const laneSlider=document.getElementById('laneSlider');
const speedVal=document.getElementById('speedVal');
const laneVal=document.getElementById('laneVal');
const scoreEl=document.getElementById('score');
const wordsLeftEl=document.getElementById('wordsLeft');
const timerToggle=document.getElementById('timerToggle');
const timerSlider=document.getElementById('timerSlider');
const timerVal=document.getElementById('timerVal');
const timerDisplay=document.getElementById('timerDisplay');
const quotesEl=document.getElementById('quotes');
const splashScreen=document.getElementById('splashScreen');
const splashBtn=document.getElementById('splashBtn');
const splashText=document.getElementById('splashText');

const rocketOverlay=document.getElementById('rocketOverlay');
const rocketCtx=rocketOverlay.getContext('2d');

/* ===== Audio ===== */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const actx = new AudioCtx();
function beep(freq=440,dur=0.07,type='square',vol=0.02){
  const o=actx.createOscillator();
  const g=actx.createGain();
  o.type=type; o.frequency.value=freq;
  o.connect(g); g.connect(actx.destination); g.gain.value=vol;
  o.start(); o.stop(actx.currentTime+dur);
}
function rocketRumble(){
  const g=actx.createGain(); g.gain.value=0.04; g.connect(actx.destination);
  const o1=actx.createOscillator(), o2=actx.createOscillator();
  o1.type='sawtooth'; o2.type='square';
  o1.frequency.setValueAtTime(90, actx.currentTime);
  o2.frequency.setValueAtTime(55, actx.currentTime);
  o1.frequency.exponentialRampToValueAtTime(140, actx.currentTime+0.6);
  o2.frequency.exponentialRampToValueAtTime(70, actx.currentTime+0.6);
  o1.connect(g); o2.connect(g);
  const end=actx.currentTime+0.7;
  g.gain.setValueAtTime(0.045, actx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, end);
  o1.start(); o2.start(); o1.stop(end); o2.stop(end);
}
function fireworksPop(){
  [900,1100,1300].forEach((f,i)=>{
    const delay= i*0.08;
    const o=actx.createOscillator(), g=actx.createGain();
    o.type='triangle'; o.frequency.value=f;
    o.connect(g); g.connect(actx.destination);
    g.gain.setValueAtTime(0.03, actx.currentTime+delay);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime+delay+0.2);
    o.start(actx.currentTime+delay); o.stop(actx.currentTime+delay+0.22);
  });
}

/* ===== quotes ===== */
const QUOTES=["You are brave and strong!","Trust yourself—you can do it!","Every step shows courage!","You are unstoppable!"];
let quoteIndex=0;
function rotateQuotes(){ quotesEl.textContent=QUOTES[quoteIndex]; quoteIndex=(quoteIndex+1)%QUOTES.length; }
setInterval(rotateQuotes,5000); rotateQuotes();

/* ===== words & lanes ===== */
function laneX(l){ return l*laneW+laneW/2; }
function randColor(){ const colors=["#0f0","#0ff","#ff0","#f0f","#f60","#0fa","#ff3","#f3f","#3ff","#f06","#f33","#33f","#fff"];
  return colors[Math.floor(Math.random()*colors.length)];
}

/* ===== Math problem generator ===== */
function generateMathProblem(){
  let a = Math.floor(Math.random()*maxOperand);
  let b = Math.floor(Math.random()*maxOperand);
  let op = document.querySelector('input[name="mode"]:checked').value;
  if(op==='both'){ op = Math.random()<0.5 ? '+' : '-'; }
  if(!document.getElementById('allowNeg').checked && op==='-' && b>a){
    [a,b]=[b,a];
  }
  const text = `${a}${op}${b}`;
  const answer = op==='+' ? a+b : a-b;
  return { text, answer };
}

/* Random spawn timing */
let nextSpawnAt=0;
function scheduleNextSpawn(){ nextSpawnAt = Date.now() + 350 + Math.random()*1100; }
function spawnWord(){
  if(wordsLeft<=0 || spawnedCount>=totalWordsInLevel) return;
  if(Date.now() < nextSpawnAt) return;
  const l = Math.floor(Math.random()*lanes);
  const crowded=words.some(w=>w.lane===l && w.y<80 && !w.fly);
  if(!crowded){
    const problem = generateMathProblem();
    words.push({ text: problem.text, answer: problem.answer, lane:l, y:-10, progress:0, input:'', done:false, fly:false, alpha:1, color: randColor() });
    spawnedCount++;
  }
  scheduleNextSpawn();
}

/* ===== Rocket Class ===== */
class Rocket{
  constructor(canvas, audioFuncs, levelCompleteCb){
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.levelCompleteCb = levelCompleteCb;
    this.x=60; this.y=H-80; this.height=40; this.width=20; this.audio=audioFuncs; this.flying=false;
    this.draw();
  }
  draw(){
    const ctx=this.ctx; ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.fillStyle='#fff'; ctx.fillRect(this.x,this.y,this.width,this.height);
  }
  grow(){ this.height +=6; this.y-=6; this.draw(); this.audio.rocketRumble(); }
  launch(){
    this.flying=true; let interval = setInterval(()=>{
      if(this.y<-50){ clearInterval(interval); this.audio.fireworksPop(); this.levelCompleteCb(); return; }
      this.y-=6; this.draw();
    },16);
  }
  resetForLevel(){ this.height=40; this.y=H-80; this.draw(); this.flying=false; }
}

/* ===== Level Reset ===== */
let rocket;
function resetLevel(keepLevelNumber=false){
  if(!keepLevelNumber) level=1;
  score=0; lives=3; running=true; gameOver=false; words=[]; rocketLaunched=false; lastOutcomeSuccess=false;
  lanes=parseInt(laneSlider.value); laneW=W/lanes;
  speedValue=parseFloat(speedSlider.value)/4;
  totalWordsInLevel = 20;
  spawnedCount=0;
  wordsLeft=totalWordsInLevel;
  startTime = Date.now();
  timerDuration=parseInt(timerSlider.value)*60*1000;
  maxOperand = level<=2 ? 10 : 20;
  updateScore();
  scheduleNextSpawn();
  draw();
  if(!rocket){
    rocket = new Rocket(
      rocketOverlay,
      { fireworksPop, rocketRumble, actx },
      ()=>{ splashLevelOver(true); level++; }
    );
  } else { rocket.resetForLevel(); }
}
function startNextLevel(){ resetLevel(true); }

/* ===== scoreboard ===== */
function updateScore(){ scoreEl.textContent=score; wordsLeftEl.textContent=wordsLeft; }

/* ===== draw ===== */
function drawWord(w){
  const x=laneX(w.lane), y=w.y;
  ctx.font='28px monospace'; ctx.textAlign='center';
  ctx.fillStyle=w.color;
  let displayText = w.text + (w.input ? ` (${w.input})` : '');
  if(w.fly){ w.y-=6; w.alpha-=0.07; ctx.fillStyle=`rgba(255,255,255,${w.alpha})`; ctx.fillText(displayText,x,y); if(w.alpha<=0) w.done=true; return; }
  if(w.done && !w.fly){ ctx.fillStyle="#f00"; ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI); ctx.fillText(displayText,0,0); ctx.restore(); return; }
  ctx.fillText(displayText,x,y);
}
function draw(){
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#0f0"; ctx.lineWidth=1;
  for(let l=1;l<lanes;l++){ ctx.beginPath(); ctx.moveTo(l*laneW+0.5,0); ctx.lineTo(l*laneW+0.5,H); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0,floorY+12); ctx.lineTo(W,floorY+12); ctx.stroke();
  for(const w of words) drawWord(w);
  ctx.fillStyle="#0f0"; ctx.font='16px monospace'; ctx.textAlign='left'; ctx.fillText(`LIVES: ${lives}`,8,16);
  ctx.textAlign='center'; ctx.fillStyle='#ff0'; ctx.fillRect(laneX(playerLane)-15,floorY-12,30,12);
  ctx.fillStyle='#0f0'; ctx.textAlign='right'; ctx.fillText(running?'RUN':'PAUSE',W-8,16);
}

/* ===== game step ===== */
function step(){
  if(!running){ draw(); requestAnimationFrame(step); return; }
  if(timerToggle && timerToggle.checked){
    const elapsed=Date.now()-startTime, remaining=Math.max(0,timerDuration-elapsed);
    timerDisplay.textContent=Math.floor(remaining/60000)+":"+("0"+Math.floor((remaining%60000)/1000)).slice(-2);
    if(remaining<=0){ gameOver=true; running=false; lastOutcomeSuccess=false; splashLevelOver(false); return; }
  }
  spawnWord();
  for(const w of words) if(!w.done && !w.fly) w.y+=speedValue;

  for(const w of words){
    if(!w.done && !w.fly && w.y>=floorY){ lives--; w.done=true; wordsLeft = Math.max(0, wordsLeft-1); updateScore(); beep(140,0.08); if(lives<=0){ gameOver=true; running=false; lastOutcomeSuccess=false; splashLevelOver(false); } }
  }

  draw();
  requestAnimationFrame(step);
}

/* ===== keyboard input ===== */
document.addEventListener('keydown',(e)=>{
  if(e.key===' '){ running=!running; return; }
  if(e.key.toLowerCase()==='r'){ resetLevel(true); return; }

  if(e.key==='ArrowLeft'){ playerLane=Math.max(0,playerLane-1); return; }
  if(e.key==='ArrowRight'){ playerLane=Math.min(lanes-1,playerLane+1); return; }

  const target = words.find(w=>!w.done && w.lane===playerLane);
  if(!target) return;
  if(/[0-9\-]/.test(e.key)){
    if(e.key==='-' && target.input.includes('-')) return;
    target.input = (target.input||'') + e.key;
  }

  if(parseInt(target.input) === target.answer){
    target.fly=true; target.done=true; wordsLeft = Math.max(0, wordsLeft-1); updateScore();
    score+=1; rocket && rocket.grow();
    if(wordsLeft===0 && !gameOver){ rocketLaunched=true; rocket && rocket.launch(); }
  } else if(!target.answer.toString().startsWith(target.input)){ beep(180,0.03); target.input=''; }
});

/* ===== sliders ===== */
speedSlider.addEventListener('input',()=>{ speedValue=parseFloat(speedSlider.value)/4; speedVal.textContent=speedSlider.value; });
laneSlider.addEventListener('input',()=>{ 
  lanes=parseInt(laneSlider.value); 
  laneW=W/lanes; 
  laneVal.textContent=lanes; 
  // Ensure player lane is within new lane count
  playerLane = Math.min(playerLane, lanes-1);
  draw(); // Redraw to show updated lane indicator
});

/* ===== splash ===== */
splashBtn.addEventListener('click',()=>{ splashScreen.style.display='none'; startNextLevel(); });
function splashLevelOver(success){
  splashText.textContent = success? "Level Complete!" : "Game Over!";
  splashScreen.style.display='flex';
}

resetLevel();
draw(); // Draw immediately to show player lane indicator
step();
})();
</script>

</body>
</html>
