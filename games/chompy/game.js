/**
 * Chompy Game Implementation
 * A Pac-Man style maze game using the new component system
 */

export class ChompyGame {
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
    this.tileSize = 20;
    this.mazeWidth = 28;
    this.mazeHeight = 31;
    
    // Game objects
    this.player = { x: 14, y: 23, direction: 'right', nextDirection: 'right' };
    this.ghosts = [];
    this.dots = [];
    this.powerPellets = [];
    this.maze = [];
    
    // Game loop
    this.gameLoop = null;
    this.lastUpdate = 0;
    
    // Ghost AI
    this.ghostMode = 'scatter'; // scatter, chase, frightened
    this.ghostModeTimer = 0;
    this.ghostModeDuration = 7000;
    
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
    console.log('Initializing Chompy game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Initialize maze and game objects
    this.initializeMaze();
    this.initializeGhosts();
    this.initializeDots();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Chompy game initialized successfully');
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
    // Prevent default behavior for game keys
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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
        this.player.nextDirection = 'up';
        break;
      case 'ArrowDown':
        this.player.nextDirection = 'down';
        break;
      case 'ArrowLeft':
        this.player.nextDirection = 'left';
        break;
      case 'ArrowRight':
        this.player.nextDirection = 'right';
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
        this.player.nextDirection = 'up';
        break;
      case 'ArrowDown':
        this.player.nextDirection = 'down';
        break;
      case 'ArrowLeft':
        this.player.nextDirection = 'left';
        break;
      case 'ArrowRight':
        this.player.nextDirection = 'right';
        break;
    }
  }
  
  /**
   * Initialize the maze layout
   */
  initializeMaze() {
    // Simplified maze layout - in a real implementation, this would be more complex
    this.maze = [
      "############################",
      "#............##............#",
      "#.####.#####.##.#####.####.#",
      "#.####.#####.##.#####.####.#",
      "#.####.#####.##.#####.####.#",
      "#..........................#",
      "#.####.##.##########.##.####.#",
      "#.####.##.##########.##.####.#",
      "#......##....##....##......#",
      "##########.##.##.##########",
      "     #.##          ##.#     ",
      "     #.## ######## ##.#     ",
      "     #.## ######## ##.#     ",
      "##########.##.##.##########",
      "          #.##.##.#          ",
      "##########.##.##.##########",
      "#............##............#",
      "#.####.#####.##.#####.####.#",
      "#.####.#####.##.#####.####.#",
      "#..##................##..#",
      "###.##.##.##########.##.###",
      "###.##.##.##########.##.###",
      "#......##....##....##......#",
      "#.##########.##.##########.#",
      "#.##########.##.##########.#",
      "#..........................#",
      "############################"
    ];
  }
  
  /**
   * Initialize ghosts
   */
  initializeGhosts() {
    this.ghosts = [
      { x: 13, y: 11, direction: 'left', color: '#ff0000', mode: 'chase' },
      { x: 14, y: 11, direction: 'right', color: '#ffb8ff', mode: 'chase' },
      { x: 13, y: 12, direction: 'left', color: '#00ffff', mode: 'scatter' },
      { x: 14, y: 12, direction: 'right', color: '#ffb852', mode: 'scatter' }
    ];
  }
  
  /**
   * Initialize dots and power pellets
   */
  initializeDots() {
    this.dots = [];
    this.powerPellets = [];
    
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (this.maze[y] && this.maze[y][x] === '.') {
          this.dots.push({ x, y });
        } else if (this.maze[y] && this.maze[y][x] === 'o') {
          this.powerPellets.push({ x, y });
        }
      }
    }
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.update();
    }, 16); // 60 FPS
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
    
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;
    
    // Update ghost mode
    this.updateGhostMode(deltaTime);
    
    // Update player
    this.updatePlayer();
    
    // Update ghosts
    this.updateGhosts(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Check win condition
    if (this.dots.length === 0 && this.powerPellets.length === 0) {
      this.levelComplete();
    }
    
    // Render
    this.render();
  }
  
  /**
   * Update ghost mode
   */
  updateGhostMode(deltaTime) {
    this.ghostModeTimer += deltaTime;
    
    if (this.ghostModeTimer >= this.ghostModeDuration) {
      this.ghostMode = this.ghostMode === 'scatter' ? 'chase' : 'scatter';
      this.ghostModeTimer = 0;
      
      // Reverse ghost directions
      this.ghosts.forEach(ghost => {
        ghost.direction = this.getOppositeDirection(ghost.direction);
      });
    }
  }
  
  /**
   * Update player movement
   */
  updatePlayer() {
    // Try to change direction
    if (this.canMove(this.player.x, this.player.y, this.player.nextDirection)) {
      this.player.direction = this.player.nextDirection;
    }
    
    // Move in current direction
    if (this.canMove(this.player.x, this.player.y, this.player.direction)) {
      const newPos = this.getNextPosition(this.player.x, this.player.y, this.player.direction);
      this.player.x = newPos.x;
      this.player.y = newPos.y;
      
      // Handle tunnel
      if (this.player.x < 0) this.player.x = this.mazeWidth - 1;
      if (this.player.x >= this.mazeWidth) this.player.x = 0;
    }
  }
  
  /**
   * Update ghosts
   */
  updateGhosts(deltaTime) {
    this.ghosts.forEach(ghost => {
      if (this.canMove(ghost.x, ghost.y, ghost.direction)) {
        const newPos = this.getNextPosition(ghost.x, ghost.y, ghost.direction);
        ghost.x = newPos.x;
        ghost.y = newPos.y;
      } else {
        // Choose new direction
        const possibleDirections = ['up', 'down', 'left', 'right'].filter(dir => 
          this.canMove(ghost.x, ghost.y, dir)
        );
        
        if (possibleDirections.length > 0) {
          ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
      }
      
      // Handle tunnel
      if (ghost.x < 0) ghost.x = this.mazeWidth - 1;
      if (ghost.x >= this.mazeWidth) ghost.x = 0;
    });
  }
  
  /**
   * Check if player can move in direction
   */
  canMove(x, y, direction) {
    const nextPos = this.getNextPosition(x, y, direction);
    
    // Check bounds
    if (nextPos.x < 0 || nextPos.x >= this.mazeWidth || 
        nextPos.y < 0 || nextPos.y >= this.mazeHeight) {
      return false;
    }
    
    // Check maze wall
    if (this.maze[nextPos.y] && this.maze[nextPos.y][nextPos.x] === '#') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get next position based on direction
   */
  getNextPosition(x, y, direction) {
    switch (direction) {
      case 'up': return { x, y: y - 1 };
      case 'down': return { x, y: y + 1 };
      case 'left': return { x: x - 1, y };
      case 'right': return { x: x + 1, y };
      default: return { x, y };
    }
  }
  
  /**
   * Get opposite direction
   */
  getOppositeDirection(direction) {
    switch (direction) {
      case 'up': return 'down';
      case 'down': return 'up';
      case 'left': return 'right';
      case 'right': return 'left';
      default: return direction;
    }
  }
  
  /**
   * Check collisions
   */
  checkCollisions() {
    // Check dot collisions
    this.dots = this.dots.filter(dot => {
      if (this.player.x === dot.x && this.player.y === dot.y) {
        this.score += 10;
        this.container.updateScore(this.score);
        
        // Play sound if available
        if (this.container.audio && typeof this.container.audio.beep === 'function') {
          this.container.audio.beep(800, 100, 'square', 0.2);
        }
        
        return false; // Remove dot
      }
      return true;
    });
    
    // Check power pellet collisions
    this.powerPellets = this.powerPellets.filter(pellet => {
      if (this.player.x === pellet.x && this.player.y === pellet.y) {
        this.score += 50;
        this.container.updateScore(this.score);
        this.ghostMode = 'frightened';
        this.ghostModeTimer = 0;
        
        // Play sound if available
        if (this.container.audio && typeof this.container.audio.beep === 'function') {
          this.container.audio.beep(400, 200, 'square', 0.4);
        }
        
        return false; // Remove pellet
      }
      return true;
    });
    
    // Check ghost collisions
    this.ghosts.forEach(ghost => {
      if (this.player.x === ghost.x && this.player.y === ghost.y) {
        if (this.ghostMode === 'frightened') {
          // Eat ghost
          this.score += 200;
          this.container.updateScore(this.score);
          ghost.x = 13;
          ghost.y = 11;
          ghost.mode = 'scatter';
          
          // Play sound if available
          if (this.container.audio && typeof this.container.audio.beep === 'function') {
            this.container.audio.beep(200, 300, 'square', 0.6);
          }
        } else {
          // Player loses life
          this.lives--;
          this.container.updateLives(this.lives);
          
          if (this.lives <= 0) {
            this.gameOver();
          } else {
            this.resetPositions();
          }
        }
      }
    });
  }
  
  /**
   * Reset player and ghost positions
   */
  resetPositions() {
    this.player.x = 14;
    this.player.y = 23;
    this.player.direction = 'right';
    this.player.nextDirection = 'right';
    
    this.initializeGhosts();
  }
  
  /**
   * Handle level completion
   */
  levelComplete() {
    this.level++;
    this.score += 1000;
    this.container.updateScore(this.score);
    
    // Increase difficulty
    this.ghostModeDuration = Math.max(3000, this.ghostModeDuration - 500);
    
    // Reset level
    this.initializeDots();
    this.resetPositions();
    
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
    
    // Draw maze
    this.drawMaze();
    
    // Draw dots
    this.drawDots();
    
    // Draw power pellets
    this.drawPowerPellets();
    
    // Draw player
    this.drawPlayer();
    
    // Draw ghosts
    this.drawGhosts();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw the maze
   */
  drawMaze() {
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (this.maze[y] && this.maze[y][x] === '#') {
          this.ctx.fillStyle = '#2121ff';
          this.ctx.fillRect(
            x * this.tileSize, 
            y * this.tileSize, 
            this.tileSize, 
            this.tileSize
          );
        }
      }
    }
  }
  
  /**
   * Draw dots
   */
  drawDots() {
    this.ctx.fillStyle = '#ffff00';
    this.dots.forEach(dot => {
      this.ctx.beginPath();
      this.ctx.arc(
        dot.x * this.tileSize + this.tileSize / 2,
        dot.y * this.tileSize + this.tileSize / 2,
        2,
        0,
        2 * Math.PI
      );
      this.ctx.fill();
    });
  }
  
  /**
   * Draw power pellets
   */
  drawPowerPellets() {
    this.ctx.fillStyle = '#ffff00';
    this.powerPellets.forEach(pellet => {
      this.ctx.beginPath();
      this.ctx.arc(
        pellet.x * this.tileSize + this.tileSize / 2,
        pellet.y * this.tileSize + this.tileSize / 2,
        6,
        0,
        2 * Math.PI
      );
      this.ctx.fill();
    });
  }
  
  /**
   * Draw player
   */
  drawPlayer() {
    const x = this.player.x * this.tileSize + this.tileSize / 2;
    const y = this.player.y * this.tileSize + this.tileSize / 2;
    const radius = this.tileSize / 2 - 2;
    
    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw mouth
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI);
    this.ctx.fill();
  }
  
  /**
   * Draw ghosts
   */
  drawGhosts() {
    this.ghosts.forEach(ghost => {
      const x = ghost.x * this.tileSize + this.tileSize / 2;
      const y = ghost.y * this.tileSize + this.tileSize / 2;
      const radius = this.tileSize / 2 - 2;
      
      // Ghost color based on mode
      let color = ghost.color;
      if (this.ghostMode === 'frightened') {
        color = '#2121ff';
      }
      
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI);
      this.ctx.fillRect(x - radius, y, radius * 2, radius);
      this.ctx.fill();
      
      // Ghost eyes
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(x - 4, y - 2, 2, 0, 2 * Math.PI);
      this.ctx.arc(x + 4, y - 2, 2, 0, 2 * Math.PI);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(x - 4, y - 2, 1, 0, 2 * Math.PI);
      this.ctx.arc(x + 4, y - 2, 1, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }
  
  /**
   * Draw UI elements
   */
  drawUI() {
    // Draw score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
    this.ctx.fillText(`Level: ${this.level}`, 10, 40);
    this.ctx.fillText(`Lives: ${this.lives}`, 10, 60);
    
    // Draw ghost mode
    this.ctx.fillStyle = this.ghostMode === 'frightened' ? '#2121ff' : '#fff';
    this.ctx.fillText(`Mode: ${this.ghostMode}`, 10, 80);
  }
  
  /**
   * Show the main menu
   */
  showMenu() {
    this.gameState = 'menu';
    this.render();
    
    // Draw menu text
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CHOMPY', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Arrow keys to move', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('Eat all dots to complete level', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
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
    this.ghostMode = 'scatter';
    this.ghostModeTimer = 0;
    this.ghostModeDuration = 7000;
    
    this.initializeMaze();
    this.initializeGhosts();
    this.initializeDots();
    this.resetPositions();
    
    // Update displays
    this.container.updateScore(this.score);
    this.container.updateLives(this.lives);
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

export default ChompyGame;
