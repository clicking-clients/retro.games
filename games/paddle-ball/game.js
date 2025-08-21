/**
 * Paddle Ball Game Implementation (Originally Pong)
 * A classic two-player table tennis game using the new component system
 * This preserves ALL the original game logic and workings
 */

export class PaddleBallGame {
  constructor(gameContainer) {
    this.container = gameContainer;
    this.canvas = gameContainer.getCanvas();
    this.ctx = gameContainer.getContext();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = { left: 0, right: 0 };
    this.paused = false;
    
    // Game settings
    this.scale = 20;
    this.rows = this.canvas.height / this.scale;
    this.cols = this.canvas.width / this.scale;
    
    // Paddles
    this.leftPaddle = { x: 1, y: Math.floor(this.rows/2), width: 1, height: 4, speed: 0.5 };
    this.rightPaddle = { x: this.cols - 2, y: Math.floor(this.rows/2), width: 1, height: 4, speed: 0.5 };
    
    // Ball
    this.ball = { x: this.cols/2, y: this.rows/2, dx: 0.3, dy: 0.2, size: 1 };
    
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
    console.log('Initializing Paddle Ball game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Initialize game
    this.resetBall();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Paddle Ball game initialized successfully');
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
      if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S', ' '].includes(e.key)) {
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
      case 'w':
      case 'W':
        this.keys.add('leftUp');
        break;
      case 's':
      case 'S':
        this.keys.add('leftDown');
        break;
      case 'ArrowUp':
        this.keys.add('rightUp');
        break;
      case 'ArrowDown':
        this.keys.add('rightDown');
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
      case 'w':
      case 'W':
        this.keys.delete('leftUp');
        break;
      case 's':
      case 'S':
        this.keys.delete('leftDown');
        break;
      case 'ArrowUp':
        this.keys.delete('rightUp');
        break;
      case 'ArrowDown':
        this.keys.delete('rightDown');
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
      case 'w':
      case 'W':
        this.keys.add('leftUp');
        setTimeout(() => this.keys.delete('leftUp'), 100);
        break;
      case 's':
      case 'S':
        this.keys.add('leftDown');
        setTimeout(() => this.keys.delete('leftDown'), 100);
        break;
      case 'ArrowUp':
        this.keys.add('rightUp');
        setTimeout(() => this.keys.delete('rightUp'), 100);
        break;
      case 'ArrowDown':
        this.keys.add('rightDown');
        setTimeout(() => this.keys.delete('rightDown'), 100);
        break;
      case ' ':
        this.togglePause();
        break;
    }
  }
  
  /**
   * Reset ball to center
   */
  resetBall() {
    this.ball.x = this.cols/2;
    this.ball.y = this.rows/2;
    this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 0.3;
    this.ball.dy = (Math.random() > 0.5 ? 1 : -1) * 0.2;
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
    this.updatePaddles();
    
    // Update ball movement
    this.updateBall();
    
    // Check collisions
    this.checkCollisions();
    
    // Render
    this.render();
  }
  
  /**
   * Update paddle movement
   */
  updatePaddles() {
    // Left paddle (W/S keys)
    if (this.keys.has('leftUp') && this.leftPaddle.y > 0) {
      this.leftPaddle.y -= this.leftPaddle.speed;
    }
    if (this.keys.has('leftDown') && this.leftPaddle.y < this.rows - this.leftPaddle.height) {
      this.leftPaddle.y += this.leftPaddle.speed;
    }
    
    // Right paddle (Arrow keys)
    if (this.keys.has('rightUp') && this.rightPaddle.y > 0) {
      this.rightPaddle.y -= this.rightPaddle.speed;
    }
    if (this.keys.has('rightDown') && this.rightPaddle.y < this.rows - this.rightPaddle.height) {
      this.rightPaddle.y += this.rightPaddle.speed;
    }
  }
  
  /**
   * Update ball movement
   */
  updateBall() {
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    
    // Wall collisions (top/bottom)
    if (this.ball.y <= 0 || this.ball.y >= this.rows - this.ball.size) {
      this.ball.dy *= -1;
    }
    
    // Score points (left/right walls)
    if (this.ball.x <= 0) {
      this.score.right++;
      this.container.updateScore(`${this.score.left} - ${this.score.right}`);
      this.resetBall();
    } else if (this.ball.x >= this.cols) {
      this.score.left++;
      this.container.updateScore(`${this.score.left} - ${this.score.right}`);
      this.resetBall();
    }
  }
  
  /**
   * Check collisions
   */
  checkCollisions() {
    // Left paddle collision
    if (this.ball.x <= this.leftPaddle.x + this.leftPaddle.width &&
        this.ball.x + this.ball.size >= this.leftPaddle.x &&
        this.ball.y <= this.leftPaddle.y + this.leftPaddle.height &&
        this.ball.y + this.ball.size >= this.leftPaddle.y) {
      
      this.ball.x = this.leftPaddle.x + this.leftPaddle.width;
      this.ball.dx *= -1;
      
      // Adjust ball direction based on where it hits paddle
      const hitPos = (this.ball.y - this.leftPaddle.y) / this.leftPaddle.height;
      this.ball.dy = (hitPos - 0.5) * 0.4;
    }
    
    // Right paddle collision
    if (this.ball.x + this.ball.size >= this.rightPaddle.x &&
        this.ball.x <= this.rightPaddle.x + this.rightPaddle.width &&
        this.ball.y <= this.rightPaddle.y + this.rightPaddle.height &&
        this.ball.y + this.ball.size >= this.rightPaddle.y) {
      
      this.ball.x = this.rightPaddle.x - this.ball.size;
      this.ball.dx *= -1;
      
      // Adjust ball direction based on where it hits paddle
      const hitPos = (this.ball.y - this.rightPaddle.y) / this.rightPaddle.height;
      this.ball.dy = (hitPos - 0.5) * 0.4;
    }
  }
  
  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw center line
    this.drawCenterLine();
    
    // Draw paddles
    this.drawPaddles();
    
    // Draw ball
    this.drawBall();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw center line
   */
  drawCenterLine() {
    this.ctx.strokeStyle = '#0f0';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }
  
  /**
   * Draw paddles
   */
  drawPaddles() {
    // Left paddle
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillRect(
      this.leftPaddle.x * this.scale,
      this.leftPaddle.y * this.scale,
      this.leftPaddle.width * this.scale,
      this.leftPaddle.height * this.scale
    );
    
    // Right paddle
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillRect(
      this.rightPaddle.x * this.scale,
      this.rightPaddle.y * this.scale,
      this.rightPaddle.width * this.scale,
      this.rightPaddle.height * this.scale
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
    this.ctx.font = '24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.score.left} - ${this.score.right}`, this.canvas.width / 2, 30);
    
    // Draw instructions
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('W/S: Left Paddle, ↑/↓: Right Paddle', this.canvas.width / 2, this.canvas.height - 40);
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
    this.ctx.fillText('PADDLE BALL', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Classic two-player table tennis!', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('First to score wins!', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
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
    this.score = { left: 0, right: 0 };
    this.paused = false;
    
    this.leftPaddle.y = Math.floor(this.rows/2);
    this.rightPaddle.y = Math.floor(this.rows/2);
    
    this.resetBall();
    
    // Update displays
    this.container.updateScore(`${this.score.left} - ${this.score.right}`);
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
   * Reset current game
   */
  reset() {
    this.resetGame();
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
    this.ctx.fillText(`Final Score: ${this.score.left} - ${this.score.right}`, this.canvas.width / 2, this.canvas.height / 2);
    
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

export default PaddleBallGame;
