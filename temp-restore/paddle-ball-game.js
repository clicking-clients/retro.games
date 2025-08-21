<script>
const canvas = document.getElementById('pongGame');
const context = canvas.getContext('2d');
const scale = 20;
const rows = canvas.height / scale;
const cols = canvas.width / scale;
let paused = false;
let speed = parseInt(document.getElementById('speedInput').value);
let paddleSpeed = 3; // Increased paddle movement per key press

let paddleHeight = 4;
let leftPaddle = {y: rows/2 - paddleHeight/2};
let rightPaddle = {y: rows/2 - paddleHeight/2};
let ball = {x: cols/2, y: rows/2, dx: 1, dy: 1};
let score = [0,0];
let lastTime = 0;

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.save();
    context.scale(scale, scale);

    // paddles
    context.fillStyle = '#0f0';
    for(let i=0;i<paddleHeight;i++){
        context.fillRect(0, leftPaddle.y + i, 1, 1);
        context.fillRect(cols-1, rightPaddle.y + i, 1, 1);
    }

    // ball
    context.fillRect(ball.x, ball.y, 1, 1);

    context.restore();
    document.getElementById('score').textContent = score[0] + ' - ' + score[1];
}

function update(time = 0) {
    if(paused) {
        requestAnimationFrame(update);
        return;
    }
    if(time - lastTime < speed) {
        requestAnimationFrame(update);
        return;
    }
    lastTime = time;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if(ball.y < 0 || ball.y >= rows) ball.dy *= -1;
    if(ball.x === 1 && ball.y >= leftPaddle.y && ball.y < leftPaddle.y + paddleHeight) ball.dx *= -1;
    if(ball.x === cols-2 && ball.y >= rightPaddle.y && ball.y < rightPaddle.y + paddleHeight) ball.dx *= -1;

    if(ball.x < 0){ score[1]++; resetBall(); }
    if(ball.x >= cols){ score[0]++; resetBall(); }

    draw();
    requestAnimationFrame(update);
}

function resetBall() {
    ball.x = cols/2;
    ball.y = rows/2;
    ball.dx = Math.random() > 0.5 ? 1 : -1;
    ball.dy = Math.random() > 0.5 ? 1 : -1;
}

document.getElementById('speedInput').addEventListener('change', e => {
    speed = parseInt(e.target.value);
});

document.addEventListener('keydown', e => {
    switch(e.code){
        case 'KeyW': if(leftPaddle.y>0) leftPaddle.y = Math.max(0, leftPaddle.y - paddleSpeed); break;
        case 'KeyS': if(leftPaddle.y+paddleHeight<rows) leftPaddle.y = Math.min(rows - paddleHeight, leftPaddle.y + paddleSpeed); break;
        case 'ArrowUp': if(rightPaddle.y>0) rightPaddle.y = Math.max(0, rightPaddle.y - paddleSpeed); break;
        case 'ArrowDown': if(rightPaddle.y+paddleHeight<rows) rightPaddle.y = Math.min(rows - paddleHeight, rightPaddle.y + paddleSpeed); break;
        case 'KeyP': paused = !paused; break;
        case 'KeyR': score=[0,0]; resetBall(); break;
    }
});

resetBall();
update();
</script>
</body>
</html>
