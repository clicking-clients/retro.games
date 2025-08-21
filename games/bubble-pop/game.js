/**
 * Bubble Pop Game Implementation (Originally Wall Breaker)
 * A classic breakout-style game using the new component system
 * This preserves ALL the original game logic and workings
 */

export class BubblePopGame {
  constructor(gameContainer) {
    this.container = gameContainer;
    this.canvas = gameContainer.getCanvas();
    this.ctx = gameContainer.getContext();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.paused = false;
    this.respawning = false;
    
    // Game settings
    this.scale = 20;
    this.rows = this.canvas.height / this.scale;
    this.cols = this.canvas.width / this.scale;
    this.paddleSpeed = 0.5;
    
    // Game objects
    this.paddle = { width: 6, height: 1, x: Math.floor(this.cols/2 - 3), y: this.rows - 2 };
    this.ball = { x: this.cols/2, y: this.rows-3, dx: 0.15, dy: -0.15, size: 1 };
    
    // Bricks
    this.brickRows = 6;
    this.brickCols = 10;
    this.bricks = [];
    this.brickColors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
    
    // Game loop
    this.gameLoop = null;
    this.lastUpdate = 0;
    
    // Input handling
    this.keys = new Set();
    this.setupInputHandling();
    
    // Bind methods
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.gameOver = this.gameOver.bind(this);
  }
  
  /**
   * Initialize the game
   */
  async init() {
    console.log('Initializing Bubble Pop game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Initialize game
    this.initBricks();
    this.resetBall();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Bubble Pop game initialized successfully');
  }
  
  /**
   * Setup canvas and context
   */
  setupCanvas() {
    this.canvas.width = this.container.config.canvasWidth;
    this.canvas.height = this.container.config.canvasHeight;
    
    // Set canvas style for pixel-perfect rendering
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.imageRendering = '-moz-crisp-edges';
    this.ctx.imageSmoothingEnabled = false;
    
    // Recalculate rows and cols for new canvas size
    this.rows = this.canvas.height / this.scale;
    this.cols = this.canvas.width / this.scale;
  }
  
  /**
   * Setup game events
   */
  setupGameEvents() {
    // Listen for game container events
    this.container.on('keydown', (e) => this.handleKeyDown(e));
    this.container.on('keyup', (e) => this.handleKeyUp(e));
    this.container.on('touchcontrol', (data) => this.handleTouchControl(data));
    
    // Listen for pause/resume
    this.container.on('pause', () => this.pause());
    this.container.on('resume', () => this.resume());
  }
  
  /**
   * Setup input handling
   */
  setupInputHandling() {
    // Prevent default behavior for arrow keys
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });
  }
  
  /**
   * Handle key down events
   */
  handleKeyDown(e) {
    if (this.gameState !== 'playing') return;
    
    const key = e.key;
    
    switch (key) {
      case 'ArrowLeft':
        this.keys.add('left');
        break;
      case 'ArrowRight':
        this.keys.add('right');
        break;
      case 'p':
      case 'P':
        this.togglePause();
        break;
      case 'r':
      case 'R':
        this.reset();
        break;
      case ' ':
        this.togglePause();
        break;
    }
  }
  
  /**
   * Handle key up events
   */
  handleKeyUp(e) {
    const key = e.key;
    
    switch (key) {
      case 'ArrowLeft':
        this.keys.delete('left');
        break;
      case 'ArrowRight':
        this.keys.delete('right');
        break;
    }
  }
  
  /**
   * Handle touch controls
   */
  handleTouchControl(data) {
    if (this.gameState !== 'playing') return;
    
    const key = data.key;
    
    switch (key) {
      case 'ArrowLeft':
        this.keys.add('left');
        setTimeout(() => this.keys.delete('left'), 100);
        break;
      case 'ArrowRight':
        this.keys.add('right');
        setTimeout(() => this.keys.delete('right'), 100);
        break;
      case ' ':
        this.togglePause();
        break;
    }
  }
  
  /**
   * Initialize bricks
   */
  initBricks() {
    this.bricks.length = 0;
    for (let r = 0; r < this.brickRows; r++) {
      for (let c = 0; c < this.brickCols; c++) {
        this.bricks.push({ 
          x: 2 + c * 4, 
          y: 2 + r * 2, 
          w: 3, 
          h: 1, 
          alive: true, 
          color: this.brickColors[r % this.brickColors.length] 
        });
      }
    }
  }
  
  /**
   * Reset ball
   */
  resetBall() {
    this.ball.x = this.cols/2;
    this.ball.y = this.rows-3;
    this.ball.dx = 0.15;
    this.ball.dy = -0.15;
    this.respawning = false;
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.update();
    }, 16); // 60 FPS - original speed
  }
  
  /**
   * Stop the game loop
   */
  stopGameLoop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }
  
  /**
   * Update game state
   */
  update() {
    if (this.gameState !== 'playing' || this.paused) return;
    
    // Update paddle movement
    this.updatePaddle();
    
    // Update ball movement
    this.updateBall();
    
    // Check collisions
    this.checkCollisions();
    
    // Check win/lose conditions
    this.checkGameState();
    
    // Render
    this.render();
  }
  
  /**
   * Update paddle movement
   */
  updatePaddle() {
    if (this.keys.has('left') && this.paddle.x > 0) {
      this.paddle.x -= this.paddleSpeed;
    }
    if (this.keys.has('right') && this.paddle.x < this.cols - this.paddle.width) {
      this.paddle.x += this.paddleSpeed;
    }
  }
  
  /**
   * Update ball movement
   */
  updateBall() {
    if (this.respawning) return;
    
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    
    // Wall collisions
    if (this.ball.x <= 0 || this.ball.x >= this.cols - this.ball.size) {
      this.ball.dx *= -1;
    }
    if (this.ball.y <= 0) {
      this.ball.dy *= -1;
    }
    
    // Ball fell off screen
    if (this.ball.y >= this.rows) {
      this.lives--;
      this.container.updateLives(this.lives);
      
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      
      this.respawning = true;
      setTimeout(() => this.resetBall(), 1000);
    }
  }
  
  /**
   * Check collisions
   */
  checkCollisions() {
    // Paddle collision
    if (this.ball.y + this.ball.size >= this.paddle.y && 
        this.ball.x >= this.paddle.x && 
        this.ball.x < this.paddle.x + this.paddle.width) {
      this.ball.dy *= -1;
      
      // Adjust ball direction based on where it hits paddle
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
      this.ball.dx = (hitPos - 0.5) * 0.3;
    }
    
    // Brick collisions
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];
      if (!brick.alive) continue;
      
      if (this.ball.x < brick.x + brick.w &&
          this.ball.x + this.ball.size > brick.x &&
          this.ball.y < brick.y + brick.h &&
          this.ball.y + this.ball.size > brick.y) {
        
        // Ball collision
        brick.alive = false;
        this.ball.dy *= -1;
        
        // Score
        this.score += 10;
        this.container.updateScore(this.score);
        
        // Remove brick
        this.bricks.splice(i, 1);
        
        // Check for level completion
        if (this.bricks.length === 0) {
          this.levelComplete();
        }
        
        break;
      }
    }
  }
  
  /**
   * Check game state
   */
  checkGameState() {
    // Check if all bricks are destroyed
    if (this.bricks.length === 0) {
      this.levelComplete();
    }
  }
  
  /**
   * Handle level completion
   */
  levelComplete() {
    this.level++;
    this.container.updateLives(this.level);
    
    // Increase difficulty
    this.ball.dx *= 1.1;
    this.ball.dy *= 1.1;
    
    // Reset level
    this.initBricks();
    this.resetBall();
    
    // Show level complete message
    this.container.showStatus(`Level ${this.level - 1} Complete!`, 'success');
    setTimeout(() => this.container.hideStatus(), 2000);
  }
  
  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw bricks
    this.drawBricks();
    
    // Draw paddle
    this.drawPaddle();
    
    // Draw ball
    this.drawBall();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw bricks
   */
  drawBricks() {
    this.bricks.forEach(brick => {
      if (brick.alive) {
        this.ctx.fillStyle = brick.color;
        this.ctx.fillRect(
          brick.x * this.scale,
          brick.y * this.scale,
          brick.w * this.scale,
          brick.h * this.scale
        );
        
        // Brick border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
          brick.x * this.scale,
          brick.y * this.scale,
          brick.w * this.scale,
          brick.h * this.scale
        );
      }
    });
  }
  
  /**
   * Draw paddle
   */
  drawPaddle() {
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillRect(
      this.paddle.x * this.scale,
      this.paddle.y * this.scale,
      this.paddle.width * this.scale,
      this.paddle.height * this.scale
    );
  }
  
  /**
   * Draw ball
   */
  drawBall() {
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(
      this.ball.x * this.scale + this.ball.size * this.scale / 2,
      this.ball.y * this.scale + this.ball.size * this.scale / 2,
      this.ball.size * this.scale / 2,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }
  
  /**
   * Draw UI elements
   */
  drawUI() {
    // Draw score
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
    this.ctx.fillText(`Lives: ${this.lives}`, 10, 40);
    this.ctx.fillText(`Level: ${this.level}`, 10, 60);
    
    // Draw instructions
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Left/Right Arrows or Mouse: Move Paddle', this.canvas.width / 2, this.canvas.height - 40);
    this.ctx.fillText('P: Pause, R: Reset', this.canvas.width / 2, this.canvas.height - 20);
  }
  
  /**
   * Show the main menu
   */
  showMenu() {
    this.gameState = 'menu';
    this.render();
    
    // Draw menu text
    this.ctx.fillStyle = '#ff0';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('BUBBLE POP', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Break all the bubbles!', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('Use arrow keys to move paddle', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
    // Listen for space key to start
    const startHandler = (e) => {
      if (e.key === ' ') {
        this.startGame();
        document.removeEventListener('keydown', startHandler);
      }
    };
    document.addEventListener('keydown', startHandler);
  }
  
  /**
   * Start the game
   */
  startGame() {
    this.gameState = 'playing';
    this.resetGame();
    this.container.getCanvas().focus();
  }
  
  /**
   * Reset game state
   */
  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.paused = false;
    this.respawning = false;
    
    this.initBricks();
    this.resetBall();
    
    // Update displays
    this.container.updateScore(this.score);
    this.container.updateLives(this.lives);
  }
  
  /**
   * Pause the game
   */
  pause() {
    if (this.gameState === 'playing') {
      this.paused = true;
      this.container.showStatus('Game Paused - Press P to resume', 'warning');
    }
  }
  
  /**
   * Resume the game
   */
  resume() {
    if (this.gameState === 'playing') {
      this.paused = false;
      this.container.hideStatus();
    }
  }
  
  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }
  
  /**
   * Reset current level
   */
  reset() {
    this.initBricks();
    this.resetBall();
  }
  
  /**
   * Handle game over
   */
  gameOver() {
    this.gameState = 'gameOver';
    this.stopGameLoop();
    
    // Show game over screen
    this.render();
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#f00';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px monospace';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(`Level Reached: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Press SPACE to play again', this.canvas.width / 2, this.canvas.height / 2 + 70);
    this.ctx.fillText('Press H to go home', this.canvas.width / 2, this.canvas.height / 2 + 100);
    
    // Listen for restart or home
    const gameOverHandler = (e) => {
      if (e.key === ' ') {
        this.startGame();
        document.removeEventListener('keydown', gameOverHandler);
      } else if (e.key === 'h' || e.key === 'H') {
        window.location.href = '../../index.html';
      }
    };
    document.addEventListener('keydown', gameOverHandler);
  }
  
  /**
   * Restart the game
   */
  restart() {
    this.startGame();
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    this.stopGameLoop();
    // Remove any event listeners
  }
}

export default BubblePopGame;
