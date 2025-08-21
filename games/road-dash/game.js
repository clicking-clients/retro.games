/**
 * Road Dash Game Implementation (Originally Road Crosser/Frogger)
 * A classic road crossing game using the new component system
 * This preserves ALL the original game logic and workings
 */

export class RoadDashGame {
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
    
    // Game settings
    this.scale = 20;
    this.rows = this.canvas.height / this.scale;
    this.cols = this.canvas.width / this.scale;
    
    // Player (frog)
    this.frog = { x: Math.floor(this.cols/2), y: this.rows - 1, size: 1 };
    
    // Vehicles
    this.vehicles = [];
    this.vehicleSpeed = 2;
    
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
    console.log('Initializing Road Dash game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Initialize game
    this.initVehicles();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Road Dash game initialized successfully');
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
      case 'ArrowUp':
        this.moveFrog(0, -1);
        break;
      case 'ArrowDown':
        this.moveFrog(0, 1);
        break;
      case 'ArrowLeft':
        this.moveFrog(-1, 0);
        break;
      case 'ArrowRight':
        this.moveFrog(1, 0);
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
    // Handle any key up logic if needed
  }
  
  /**
   * Handle touch controls
   */
  handleTouchControl(data) {
    if (this.gameState !== 'playing') return;
    
    const key = data.key;
    
    switch (key) {
      case 'ArrowUp':
        this.moveFrog(0, -1);
        break;
      case 'ArrowDown':
        this.moveFrog(0, 1);
        break;
      case 'ArrowLeft':
        this.moveFrog(-1, 0);
        break;
      case 'ArrowRight':
        this.moveFrog(1, 0);
        break;
      case ' ':
        this.togglePause();
        break;
    }
  }
  
  /**
   * Move the frog
   */
  moveFrog(dx, dy) {
    const newX = this.frog.x + dx;
    const newY = this.frog.y + dy;
    
    // Check boundaries
    if (newX >= 0 && newX < this.cols && newY >= 0 && newY < this.rows) {
      this.frog.x = newX;
      this.frog.y = newY;
      
      // Check if reached top (level complete)
      if (this.frog.y === 0) {
        this.levelComplete();
      }
    }
  }
  
  /**
   * Initialize vehicles
   */
  initVehicles() {
    this.vehicles = [];
    
    // Create vehicles on different rows
    for (let row = 1; row < this.rows - 1; row++) {
      const vehicleCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < vehicleCount; i++) {
        this.vehicles.push({
          x: Math.random() * this.cols,
          y: row,
          width: Math.floor(Math.random() * 3) + 2,
          height: 1,
          speed: (Math.random() * 0.5 + 0.5) * this.vehicleSpeed,
          direction: Math.random() > 0.5 ? 1 : -1
        });
      }
    }
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.update();
    }, 50); // 20 FPS - appropriate for road crossing game
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
    
    // Update vehicles
    this.updateVehicles();
    
    // Check collisions
    this.checkCollisions();
    
    // Render
    this.render();
  }
  
  /**
   * Update vehicles
   */
  updateVehicles() {
    this.vehicles.forEach(vehicle => {
      vehicle.x += vehicle.speed * vehicle.direction;
      
      // Wrap around screen
      if (vehicle.direction > 0 && vehicle.x > this.cols) {
        vehicle.x = -vehicle.width;
      } else if (vehicle.direction < 0 && vehicle.x + vehicle.width < 0) {
        vehicle.x = this.cols;
      }
    });
  }
  
  /**
   * Check collisions
   */
  checkCollisions() {
    this.vehicles.forEach(vehicle => {
      if (this.frog.x < vehicle.x + vehicle.width &&
          this.frog.x + this.frog.size > vehicle.x &&
          this.frog.y < vehicle.y + vehicle.height &&
          this.frog.y + this.frog.size > vehicle.y) {
        
        // Collision detected
        this.lives--;
        this.container.updateLives(this.lives);
        
        if (this.lives <= 0) {
          this.gameOver();
          return;
        }
        
        // Reset frog position
        this.frog.x = Math.floor(this.cols/2);
        this.frog.y = this.rows - 1;
      }
    });
  }
  
  /**
   * Handle level completion
   */
  levelComplete() {
    this.level++;
    this.score += 100 * this.level;
    this.container.updateScore(this.score);
    this.container.updateLives(this.level);
    
    // Increase difficulty
    this.vehicleSpeed *= 1.2;
    
    // Reset frog position
    this.frog.x = Math.floor(this.cols/2);
    this.frog.y = this.rows - 1;
    
    // Regenerate vehicles with higher speed
    this.initVehicles();
    
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
    
    // Draw road
    this.drawRoad();
    
    // Draw vehicles
    this.drawVehicles();
    
    // Draw frog
    this.drawFrog();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw the road
   */
  drawRoad() {
    // Draw road surface
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, this.scale, this.canvas.width, this.canvas.height - this.scale * 2);
    
    // Draw lane dividers
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    
    for (let row = 1; row < this.rows - 1; row++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, row * this.scale);
      this.ctx.lineTo(this.canvas.width, row * this.scale);
      this.ctx.stroke();
    }
    
    this.ctx.setLineDash([]);
  }
  
  /**
   * Draw vehicles
   */
  drawVehicles() {
    this.vehicles.forEach(vehicle => {
      this.ctx.fillStyle = '#f00';
      this.ctx.fillRect(
        vehicle.x * this.scale,
        vehicle.y * this.scale,
        vehicle.width * this.scale,
        vehicle.height * this.scale
      );
      
      // Vehicle details
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(
        vehicle.x * this.scale + 2,
        vehicle.y * this.scale + 2,
        (vehicle.width * this.scale) - 4,
        (vehicle.height * this.scale) - 4
      );
    });
  }
  
  /**
   * Draw the frog
   */
  drawFrog() {
    // Frog body
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillRect(
      this.frog.x * this.scale,
      this.frog.y * this.scale,
      this.frog.size * this.scale,
      this.frog.size * this.scale
    );
    
    // Frog eyes
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(
      this.frog.x * this.scale + 3,
      this.frog.y * this.scale + 3,
      3,
      3
    );
    this.ctx.fillRect(
      this.frog.x * this.scale + this.frog.size * this.scale - 6,
      this.frog.y * this.scale + 3,
      3,
      3
    );
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
    this.ctx.fillText('Use arrow keys to cross the road safely!', this.canvas.width / 2, this.canvas.height - 40);
    this.ctx.fillText('Reach the top to complete the level', this.canvas.width / 2, this.canvas.height - 20);
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
    this.ctx.fillText('ROAD DASH', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Help the frog cross the road safely!', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('Use arrow keys to move', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
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
    this.vehicleSpeed = 2;
    
    this.frog.x = Math.floor(this.cols/2);
    this.frog.y = this.rows - 1;
    
    this.initVehicles();
    
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
    this.frog.x = Math.floor(this.cols/2);
    this.frog.y = this.rows - 1;
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

export default RoadDashGame;
