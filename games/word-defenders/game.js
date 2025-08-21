/**
 * Wormy Game Implementation
 * A classic snake game using the new component system
 */

export class WormyGame {
  constructor(gameContainer) {
    this.container = gameContainer;
    this.canvas = gameContainer.getCanvas();
    this.ctx = gameContainer.getContext();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    
    // Game settings
    this.gridSize = 20;
    this.gameSpeed = 150;
    this.speedIncrease = 10;
    
    // Snake properties
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    
    // Food properties
    this.food = this.generateFood();
    
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
    console.log('Initializing Wormy game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Wormy game initialized successfully');
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
    this.canvas.style.imageRendering = 'crisp-edges';
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
    
    // Prevent opposite direction movement
    if (key === 'ArrowUp' && this.direction.y === 0) {
      this.nextDirection = { x: 0, y: -1 };
    } else if (key === 'ArrowDown' && this.direction.y === 0) {
      this.nextDirection = { x: 0, y: 1 };
    } else if (key === 'ArrowLeft' && this.direction.x === 0) {
      this.nextDirection = { x: -1, y: 0 };
    } else if (key === 'ArrowRight' && this.direction.x === 0) {
      this.nextDirection = { x: 1, y: 0 };
    } else if (key === ' ') {
      this.togglePause();
    }
  }
  
  /**
   * Handle key up events
   */
  handleKeyUp(e) {
    // Handle any key up logic if needed
  }
  
  /**
   * Handle touch controls
   */
  handleTouchControl(data) {
    if (this.gameState !== 'playing') return;
    
    const key = data.key;
    
    // Map touch controls to keyboard events
    if (key === 'ArrowUp' && this.direction.y === 0) {
      this.nextDirection = { x: 0, y: -1 };
    } else if (key === 'ArrowDown' && this.direction.y === 0) {
      this.nextDirection = { x: 0, y: 1 };
    } else if (key === 'ArrowLeft' && this.direction.x === 0) {
      this.nextDirection = { x: -1, y: 0 };
    } else if (key === 'ArrowRight' && this.direction.x === 0) {
      this.nextDirection = { x: 1, y: 0 };
    }
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.update();
    }, this.gameSpeed);
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
    if (this.gameState !== 'playing') return;
    
    // Update direction
    this.direction = { ...this.nextDirection };
    
    // Move snake
    this.moveSnake();
    
    // Check collisions
    if (this.checkCollisions()) {
      this.gameOver();
      return;
    }
    
    // Check food collision
    if (this.checkFoodCollision()) {
      this.eatFood();
    }
    
    // Render
    this.render();
  }
  
  /**
   * Move the snake
   */
  moveSnake() {
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    // Wrap around edges
    head.x = (head.x + this.canvas.width / this.gridSize) % (this.canvas.width / this.gridSize);
    head.y = (head.y + this.canvas.height / this.gridSize) % (this.canvas.height / this.gridSize);
    
    this.snake.unshift(head);
    
    // Remove tail (unless growing)
    if (!this.growing) {
      this.snake.pop();
    } else {
      this.growing = false;
    }
  }
  
  /**
   * Check for collisions
   */
  checkCollisions() {
    const head = this.snake[0];
    
    // Check wall collision (if not wrapping)
    if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
        head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
      return true;
    }
    
    // Check self collision
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check food collision
   */
  checkFoodCollision() {
    const head = this.snake[0];
    return head.x === this.food.x && head.y === this.food.y;
  }
  
  /**
   * Handle eating food
   */
  eatFood() {
    this.score += 10;
    this.growing = true;
    
    // Update score display
    this.container.updateScore(this.score);
    
    // Generate new food
    this.food = this.generateFood();
    
    // Increase speed every 5 food items
    if (this.score % 50 === 0) {
      this.increaseSpeed();
    }
    
    // Check for level up
    if (this.score % 100 === 0) {
      this.levelUp();
    }
    
    // Play sound if available
    if (this.container.audio && typeof this.container.audio.beep === 'function') {
      this.container.audio.beep(800, 100, 'square', 0.3);
    }
  }
  
  /**
   * Generate new food position
   */
  generateFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
        y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
      };
    } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
    
    return food;
  }
  
  /**
   * Increase game speed
   */
  increaseSpeed() {
    this.gameSpeed = Math.max(50, this.gameSpeed - this.speedIncrease);
    this.restartGameLoop();
  }
  
  /**
   * Level up
   */
  levelUp() {
    this.level++;
    this.container.updateLives(this.level); // Reusing lives display for level
    
    // Show level up message
    this.container.showStatus(`Level ${this.level}!`, 'success');
    
    // Play celebration sound if available
    if (this.container.audio && typeof this.container.audio.beep === 'function') {
      this.container.audio.beep(1000, 200, 'sine', 0.5);
    }
  }
  
  /**
   * Restart game loop with new speed
   */
  restartGameLoop() {
    this.stopGameLoop();
    this.startGameLoop();
  }
  
  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid (optional)
    this.drawGrid();
    
    // Draw snake
    this.drawSnake();
    
    // Draw food
    this.drawFood();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw the grid
   */
  drawGrid() {
    this.ctx.strokeStyle = '#0f0';
    this.ctx.lineWidth = 0.5;
    this.ctx.globalAlpha = 0.2;
    
    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.globalAlpha = 1;
  }
  
  /**
   * Draw the snake
   */
  drawSnake() {
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(
          segment.x * this.gridSize + 2,
          segment.y * this.gridSize + 2,
          this.gridSize - 4,
          this.gridSize - 4
        );
        
        // Eyes
        this.ctx.fillStyle = '#000';
        const eyeSize = 3;
        const eyeOffset = 4;
        
        if (this.direction.x === 1) { // Right
          this.ctx.fillRect(
            segment.x * this.gridSize + this.gridSize - eyeOffset,
            segment.y * this.gridSize + eyeOffset,
            eyeSize,
            eyeSize
          );
          this.ctx.fillRect(
            segment.x * this.gridSize + this.gridSize - eyeOffset,
            segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize,
            eyeSize,
            eyeSize
          );
        } else if (this.direction.x === -1) { // Left
          this.ctx.fillRect(
            segment.x * this.gridSize + eyeOffset,
            segment.y * this.gridSize + eyeOffset,
            eyeSize,
            eyeSize
          );
          this.ctx.fillRect(
            segment.x * this.gridSize + eyeOffset,
            segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize,
            eyeSize,
            eyeSize
          );
        } else if (this.direction.y === -1) { // Up
          this.ctx.fillRect(
            segment.x * this.gridSize + eyeOffset,
            segment.y * this.gridSize + eyeOffset,
            eyeSize,
            eyeSize
          );
          this.ctx.fillRect(
            segment.x * this.gridSize + this.gridSize - eyeOffset - eyeSize,
            segment.y * this.gridSize + eyeOffset,
            eyeSize,
            eyeSize
          );
        } else if (this.direction.y === 1) { // Down
          this.ctx.fillRect(
            segment.x * this.gridSize + eyeOffset,
            segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize,
            eyeSize,
            eyeSize
          );
          this.ctx.fillRect(
            segment.x * this.gridSize + this.gridSize - eyeOffset - eyeSize,
            segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize,
            eyeSize,
            eyeSize
          );
        }
      } else {
        // Body
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(
          segment.x * this.gridSize + 1,
          segment.y * this.gridSize + 1,
          this.gridSize - 2,
          this.gridSize - 2
        );
      }
    });
  }
  
  /**
   * Draw the food
   */
  drawFood() {
    this.ctx.fillStyle = '#f00';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
    
    // Add shine effect
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2 - 2,
      this.food.y * this.gridSize + this.gridSize / 2 - 2,
      2,
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
    this.ctx.fillText(`Level: ${this.level}`, 10, 40);
  }
  
  /**
   * Show the main menu
   */
  showMenu() {
    this.gameState = 'menu';
    this.render();
    
    // Draw menu text
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('WORMY', this.canvas.width / 2, this.canvas.height / 2 - 40);
    
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText('Use arrow keys to move', this.canvas.width / 2, this.canvas.height / 2 + 30);
    
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
    this.level = 1;
    this.gameSpeed = 150;
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = this.generateFood();
    this.growing = false;
    
    // Update displays
    this.container.updateScore(this.score);
    this.container.updateLives(this.lives);
    
    // Restart game loop
    this.restartGameLoop();
  }
  
  /**
   * Pause the game
   */
  pause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.stopGameLoop();
      this.container.showStatus('Game Paused - Press SPACE to resume', 'warning');
    }
  }
  
  /**
   * Resume the game
   */
  resume() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.startGameLoop();
      this.container.hideStatus();
    }
  }
  
  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.gameState === 'playing') {
      this.pause();
    } else if (this.gameState === 'paused') {
      this.resume();
    }
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
    
    this.ctx.fillStyle = '#0f0';
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
        window.location.href = '../index.html';
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

export default WormyGame;
