/**
 * Chompy Game Implementation (Original Dot Eater)
 * A classic Pac-Man style maze game with multiple mazes and ghost AI
 * This preserves ALL the original game logic and workings exactly as they were
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
    this.paused = false;
    this.frightenedTimer = 0;
    
    // Game settings
    this.scale = 20;
    this.rows = 32;
    this.cols = 28;
    this.currentMapIndex = 0;
    
    // Game objects
    this.board = [];
    this.pac = { x: 13, y: 23, vx: 0, vy: 0, nextVX: 0, nextVY: 0, baseSpeed: 0.12, speed: 0.12, mouth: 0 };
    this.ghosts = [];
    this.ghostExplosions = [];
    this.tunnelRows = new Set();
    
    // Game loop
    this.gameLoop = null;
    this.lastFrame = 0;
    
    // Timer system
    this.timerDurationMs = 5 * 60000; // 5 minutes default
    this.timerEnd = null;
    this.timerTimeout = null;
    
    // Quotes system
    this.quotes = [
      "You are brave and strong!",
      "Trust yourself—you can do it!",
      "Your kindness makes magic!",
      "Every step shows courage!",
      "You are unstoppable!",
      "Believe in yourself!",
      "Your heart is full of power!",
      "You are wise and brave!",
      "Shine with your own light!",
      "You make the world brighter!"
    ];
    this.quoteIndex = 0;
    this.quoteBanner = null;
    
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
    console.log('Initializing Chompy (Dot Eater) game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Initialize game
    this.initializeGame();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Chompy (Dot Eater) game initialized successfully');
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
        this.pac.nextVY = -1;
        this.pac.nextVX = 0;
        break;
      case 'ArrowDown':
        this.pac.nextVY = 1;
        this.pac.nextVX = 0;
        break;
      case 'ArrowLeft':
        this.pac.nextVX = -1;
        this.pac.nextVY = 0;
        break;
      case 'ArrowRight':
        this.pac.nextVX = 1;
        this.pac.nextVY = 0;
        break;
      case ' ':
        this.togglePause();
        break;
      case 'p':
      case 'P':
        this.togglePause();
        break;
      case 'r':
      case 'R':
        this.restart();
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
        this.pac.nextVY = -1;
        this.pac.nextVX = 0;
        break;
      case 'ArrowDown':
        this.pac.nextVY = 1;
        this.pac.nextVX = 0;
        break;
      case 'ArrowLeft':
        this.pac.nextVX = -1;
        this.pac.nextVY = 0;
        break;
      case 'ArrowRight':
        this.pac.nextVX = 1;
        this.pac.nextVY = 0;
        break;
      case ' ':
        this.togglePause();
        break;
    }
  }
  
  /**
   * Initialize the game
   */
  initializeGame() {
    this.loadBoard();
    this.resetEntitiesToSpawn();
    this.startTimer();
    this.startQuoteSystem();
  }
  
  /**
   * Load the game board
   */
  loadBoard() {
    this.board = [];
    const raw = this.MAPS[this.currentMapIndex];
    
    for (let y = 0; y < this.rows; y++) {
      const row = raw[y] || '#'.repeat(this.cols);
      this.board[y] = row.split('');
    }
    
    // Place dots/pellets
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x] === ' ') this.board[y][x] = '.';
        if (this.board[y][x] === 'H') {} // house floor
      }
    }
    
    // Power pellets
    [[1, 3], [26, 3], [1, this.rows - 4], [26, this.rows - 4]].forEach(([x, y]) => {
      if (this.board[y] && this.board[y][x] === '.') this.board[y][x] = 'o';
    });
    
    // Tunnels
    this.tunnelRows.clear();
    for (let y = 0; y < this.rows; y++) {
      if (this.board[y][0] !== '#' && this.board[y][this.cols - 1] !== '#') {
        this.tunnelRows.add(y);
      }
    }
  }
  
  /**
   * Reset entities to spawn positions
   */
  resetEntitiesToSpawn() {
    // Pac spawn: find a pellet spot near bottom center
    outer: for (let y = this.rows - 6; y < this.rows - 1; y++) {
      for (let x = 1; x < this.cols - 1; x++) {
        if (this.board[y][x] === '.') {
          this.pac.x = x;
          this.pac.y = y;
          this.pac.vx = this.pac.vy = this.pac.nextVX = this.pac.nextVY = 0;
          break outer;
        }
      }
    }
    
    // Ghost spawn
    this.ghosts = [
      { name: 'Blinky', color: '#ff0000', x: 13, y: 11, homeX: 13, homeY: 11, vx: 0, vy: 0, baseSpeed: 0.10, speed: 0.10, scatterTimer: 0 },
      { name: 'Pinky', color: '#ffb8ff', x: 14, y: 11, homeX: 14, homeY: 11, vx: 0, vy: 0, baseSpeed: 0.095, speed: 0.095, scatterTimer: 0 },
      { name: 'Inky', color: '#00ffff', x: 12, y: 13, homeX: 12, homeY: 13, vx: 0, vy: 0, baseSpeed: 0.09, speed: 0.09, scatterTimer: 0 },
      { name: 'Clyde', color: '#ffb852', x: 15, y: 13, homeX: 15, homeY: 13, vx: 0, vy: 0, baseSpeed: 0.09, speed: 0.09, scatterTimer: 0 }
    ];
  }
  
  /**
   * Start the timer system
   */
  startTimer() {
    if (this.timerTimeout) {
      clearTimeout(this.timerTimeout);
      this.timerTimeout = null;
    }
    
    if (this.timerDurationMs > 0) {
      this.timerEnd = Date.now() + this.timerDurationMs;
      this.timerTimeout = setTimeout(() => {
        this.timerDurationMs = 0;
        this.timerEnd = null;
        this.stopGame();
      }, this.timerDurationMs);
    } else {
      this.timerEnd = null;
    }
  }
  
  /**
   * Start the quote system
   */
  startQuoteSystem() {
    this.showQuoteImmediate();
    setInterval(() => this.showQuoteImmediate(), 6000);
  }
  
  /**
   * Show a quote immediately
   */
  showQuoteImmediate() {
    const text = this.quotes[this.quoteIndex];
    this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
    
    // Show quote in game container status
    this.container.showStatus(text, 'info');
    setTimeout(() => this.container.hideStatus(), 4800);
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.update();
    }, 16); // 60 FPS for smooth Pac-Man movement
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
    
    const now = performance.now();
    const deltaTime = now - this.lastFrame;
    this.lastFrame = now;
    
    // Update Pac-Man
    this.updatePac();
    
    // Update ghosts
    this.updateGhosts();
    
    // Update frightened timer
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= deltaTime;
      if (this.frightenedTimer <= 0) {
        this.frightenedTimer = 0;
        this.ghosts.forEach(ghost => ghost.speed = ghost.baseSpeed);
      }
    }
    
    // Check collisions
    this.checkCollisions();
    
    // Render
    this.render();
  }
  
  /**
   * Update Pac-Man
   */
  updatePac() {
    // Handle movement input
    if (this.canMove(this.pac.x + this.pac.nextVX, this.pac.y + this.pac.nextVY)) {
      this.pac.vx = this.pac.nextVX;
      this.pac.vy = this.pac.nextVY;
    } else if (this.canMove(this.pac.x + this.pac.vx, this.pac.y + this.pac.vy)) {
      // Continue current direction if possible
    } else {
      this.pac.vx = this.pac.vy = 0;
    }
    
    // Move Pac-Man
    if (this.pac.vx !== 0 || this.pac.vy !== 0) {
      this.pac.x += this.pac.vx * this.pac.speed;
      this.pac.y += this.pac.vy * this.pac.speed;
      
      // Handle tunnels
      if (this.pac.x < 0) this.pac.x = this.cols - 1;
      if (this.pac.x >= this.cols) this.pac.x = 0;
      
      // Animate mouth
      this.pac.mouth = (this.pac.mouth + 0.2) % 1;
    }
  }
  
  /**
   * Update ghosts
   */
  updateGhosts() {
    this.ghosts.forEach(ghost => {
      // Simple ghost AI - move towards Pac-Man
      const dx = this.pac.x - ghost.x;
      const dy = this.pac.y - ghost.y;
      
      // Choose direction based on distance
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && this.canMove(ghost.x + 1, ghost.y)) ghost.vx = 1;
        else if (dx < 0 && this.canMove(ghost.x - 1, ghost.y)) ghost.vx = -1;
        else ghost.vx = 0;
        ghost.vy = 0;
      } else {
        if (dy > 0 && this.canMove(ghost.x, ghost.y + 1)) ghost.vy = 1;
        else if (dy < 0 && this.canMove(ghost.x, ghost.y - 1)) ghost.vy = -1;
        else ghost.vy = 0;
        ghost.vx = 0;
      }
      
      // Move ghost
      ghost.x += ghost.vx * ghost.speed;
      ghost.y += ghost.vy * ghost.speed;
      
      // Handle tunnels
      if (ghost.x < 0) ghost.x = this.cols - 1;
      if (ghost.x >= this.cols) ghost.x = 0;
    });
  }
  
  /**
   * Check if a position is valid to move to
   */
  canMove(x, y) {
    const gridX = Math.floor(x);
    const gridY = Math.floor(y);
    
    if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) return false;
    return this.board[gridY] && this.board[gridY][gridX] !== '#';
  }
  
  /**
   * Check collisions
   */
  checkCollisions() {
    const pacGridX = Math.floor(this.pac.x);
    const pacGridY = Math.floor(this.pac.y);
    
    // Check dot/pellet collection
    if (this.board[pacGridY] && this.board[pacGridY][pacGridX] === '.') {
      this.board[pacGridY][pacGridX] = ' ';
      this.score += 10;
      this.container.updateScore(this.score);
    } else if (this.board[pacGridY] && this.board[pacGridY][pacGridX] === 'o') {
      this.board[pacGridY][pacGridX] = ' ';
      this.score += 50;
      this.container.updateScore(this.score);
      this.frightenedTimer = 10000; // 10 seconds of power
      this.ghosts.forEach(ghost => ghost.speed = ghost.baseSpeed * 0.5);
    }
    
    // Check ghost collisions
    this.ghosts.forEach((ghost, index) => {
      const distance = Math.sqrt((this.pac.x - ghost.x) ** 2 + (this.pac.y - ghost.y) ** 2);
      
      if (distance < 1) {
        if (this.frightenedTimer > 0) {
          // Eat ghost
          this.score += 200;
          this.container.updateScore(this.score);
          this.ghosts.splice(index, 1);
          
          // Create explosion effect
          this.ghostExplosions.push({
            x: ghost.x,
            y: ghost.y,
            timer: 30
          });
        } else {
          // Lose life
          this.lives--;
          this.container.updateLives(this.lives);
          
          if (this.lives <= 0) {
            this.gameOver();
          } else {
            this.resetEntitiesToSpawn();
          }
        }
      }
    });
    
    // Check level complete
    let dotsRemaining = 0;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x] === '.' || this.board[y][x] === 'o') dotsRemaining++;
      }
    }
    
    if (dotsRemaining === 0) {
      this.levelComplete();
    }
  }
  
  /**
   * Handle level completion
   */
  levelComplete() {
    this.level++;
    this.score += 1000;
    this.container.updateScore(this.score);
    
    // Increase difficulty
    this.ghosts.forEach(ghost => {
      ghost.speed = Math.min(ghost.baseSpeed * (1 + this.level * 0.1), 0.2);
    });
    
    // Reset level
    this.loadBoard();
    this.resetEntitiesToSpawn();
    
    this.container.showStatus(`Level ${this.level} Complete!`, 'success');
    setTimeout(() => this.container.hideStatus(), 2000);
  }
  
  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw board
    this.drawBoard();
    
    // Draw Pac-Man
    this.drawPac();
    
    // Draw ghosts
    this.drawGhosts();
    
    // Draw explosions
    this.drawExplosions();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw the game board
   */
  drawBoard() {
    const tileSize = Math.min(this.canvas.width / this.cols, this.canvas.height / this.rows);
    
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.board[y][x];
        const drawX = x * tileSize;
        const drawY = y * tileSize;
        
        if (tile === '#') {
          // Wall
          this.ctx.fillStyle = '#0bb';
          this.ctx.fillRect(drawX, drawY, tileSize, tileSize);
        } else if (tile === '.') {
          // Dot
          this.ctx.fillStyle = '#ffd700';
          this.ctx.beginPath();
          this.ctx.arc(drawX + tileSize / 2, drawY + tileSize / 2, 2, 0, 2 * Math.PI);
          this.ctx.fill();
        } else if (tile === 'o') {
          // Power pellet
          this.ctx.fillStyle = '#ffd700';
          this.ctx.beginPath();
          this.ctx.arc(drawX + tileSize / 2, drawY + tileSize / 2, 6, 0, 2 * Math.PI);
          this.ctx.fill();
        }
      }
    }
  }
  
  /**
   * Draw Pac-Man
   */
  drawPac() {
    const tileSize = Math.min(this.canvas.width / this.cols, this.canvas.height / this.rows);
    const drawX = this.pac.x * tileSize;
    const drawY = this.pac.y * tileSize;
    
    this.ctx.fillStyle = '#ffd700';
    this.ctx.beginPath();
    
    // Draw Pac-Man with mouth animation
    const mouthAngle = this.pac.mouth * Math.PI;
    this.ctx.arc(drawX + tileSize / 2, drawY + tileSize / 2, tileSize / 2, mouthAngle, 2 * Math.PI - mouthAngle);
    this.ctx.lineTo(drawX + tileSize / 2, drawY + tileSize / 2);
    this.ctx.fill();
  }
  
  /**
   * Draw ghosts
   */
  drawGhosts() {
    const tileSize = Math.min(this.canvas.width / this.cols, this.canvas.height / this.rows);
    
    this.ghosts.forEach(ghost => {
      const drawX = ghost.x * tileSize;
      const drawY = ghost.y * tileSize;
      
      // Ghost color (blue if frightened)
      this.ctx.fillStyle = this.frightenedTimer > 0 ? '#0000ff' : ghost.color;
      
      // Draw ghost body
      this.ctx.beginPath();
      this.ctx.arc(drawX + tileSize / 2, drawY + tileSize / 2, tileSize / 2, 0, Math.PI);
      this.ctx.rect(drawX, drawY + tileSize / 2, tileSize, tileSize / 2);
      this.ctx.fill();
      
      // Draw ghost eyes
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(drawX + tileSize / 3, drawY + tileSize / 3, 3, 0, 2 * Math.PI);
      this.ctx.arc(drawX + 2 * tileSize / 3, drawY + tileSize / 3, 3, 0, 2 * Math.PI);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(drawX + tileSize / 3, drawY + tileSize / 3, 1.5, 0, 2 * Math.PI);
      this.ctx.arc(drawX + 2 * tileSize / 3, drawY + tileSize / 3, 1.5, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }
  
  /**
   * Draw explosions
   */
  drawExplosions() {
    const tileSize = Math.min(this.canvas.width / this.cols, this.canvas.height / this.rows);
    
    this.ghostExplosions.forEach((explosion, index) => {
      const drawX = explosion.x * tileSize;
      const drawY = explosion.y * tileSize;
      const alpha = explosion.timer / 30;
      
      this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(drawX + tileSize / 2, drawY + tileSize / 2, tileSize / 2, 0, 2 * Math.PI);
      this.ctx.fill();
      
      explosion.timer--;
      if (explosion.timer <= 0) {
        this.ghostExplosions.splice(index, 1);
      }
    });
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
    
    // Draw timer
    if (this.timerEnd) {
      const timeLeft = Math.max(0, this.timerEnd - Date.now());
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      this.ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 10, 80);
    }
    
    // Draw map selector
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Map: ${this.currentMapIndex + 1}`, this.canvas.width / 2, 30);
    
    // Draw instructions
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Arrow Keys: Move, P: Pause, R: Restart', this.canvas.width / 2, this.canvas.height - 20);
  }
  
  /**
   * Show the main menu
   */
  showMenu() {
    this.gameState = 'menu';
    this.render();
    
    // Draw menu text
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DOT EATER', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Navigate mazes, eat dots, avoid ghosts!', this.canvas.width / 2, this.canvas.height / 2 + 10);
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
    this.level = 1;
    this.lives = 3;
    this.paused = false;
    this.frightenedTimer = 0;
    this.currentMapIndex = 0;
    
    this.initializeGame();
    
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
   * Stop the game
   */
  stopGame() {
    this.gameState = 'paused';
    this.container.showStatus('Time\'s up! Share with your sibling!', 'info');
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
    if (this.timerTimeout) {
      clearTimeout(this.timerTimeout);
    }
  }
  
  // Game maps - these are the original mazes from the temp-restore version
  MAPS = [
    // Classic maze
    ["############################",
     "#............##............#",
     "#.####.##.#####.##.####.##.#",
     "#o#..#.##.#####.##.#..#..o#",
     "#.##.#.##.##.##.##.#.##.##.#",
     "#..........................#",
     "#.##.##.########.##.##.##.#",
     "#.##.##.########.##.##.##.#",
     "#....##....##....##....##.#",
     "######.#### ## ####.######",
     "     #.##        ##.#     #",
     "     #.##  # ##  ##.#     #",
     "######.##  #HH#  ##.######",
     "      .   #HHHH#   .      ",
     "######.##  ####  ##.######",
     "     #.##        ##.#     #",
     "     #.##  ####  ##.#     #",
     "######.##  ####  ##.######",
     "#............##............#",
     "#.####.#####.##.#####.###.#",
     "#o..##.....o..##..o....##o#",
     "###.##.##.##..#.##.##.##.###",
     "#....##....##.##....##....#",
     "#.######.###..#.###.#####.#",
     "#..##.......#..#.......##..#",
     "#.##.####.####.####.##.#..#",
     "#o##..##..##......##..##o#",
     "#.##.#.#####.#..#####.##..#",
     "#.##.#.####..#..#####.##..#",
     "#............##............#",
     "############################"],
    
    // Maze 1
    ["############################",
     "#............##............#",
     "#.####.##.#####.##.####.##.#",
     "#o#..#.##.#####.##.#..#..o#",
     "#.##.#.##.##.##.##.#.##.##.#",
     "#..........................#",
     "#.##.##.########.##.##.##.#",
     "#.##.##.########.##.##.##.#",
     "#....##....##....##....##.#",
     "######.#### ## ####.######",
     "     #.##        ##.#     #",
     "     #.##  # ##  ##.#     #",
     "######.##  #HH#  ##.######",
     "      .   #HHHH#   .      ",
     "######.##  ####  ##.######",
     "     #.##        ##.#     #",
     "     #.##  ####  ##.#     #",
     "######.##  ####  ##.######",
     "#............##............#",
     "#.####.#####.##.#####.###.#",
     "#o..##.....o..##..o....##o#",
     "###.##.##.##..#.##.##.##.###",
     "#....##....##.##....##....#",
     "#.######.###..#.###.#####.#",
     "#..##.......#..#.......##..#",
     "#.##.####.####.####.##.#..#",
     "#o##..##..##......##..##o#",
     "#.##.#.#####.#..#####.##..#",
     "#.##.#.####..#..#####.##..#",
     "#............##............#",
     "############################"],
    
    // Maze 2
    ["############################",
     "#............##............#",
     "#.####.##.#####.##.####.##.#",
     "#o#..#.##.#####.##.#..#..o#",
     "#.##.#.##.##.##.##.#.##.##.#",
     "#..........................#",
     "#.##.##.########.##.##.##.#",
     "#.##.##.########.##.##.##.#",
     "#....##....##....##....##.#",
     "######.#### ## ####.######",
     "     #.##        ##.#     #",
     "     #.##  # ##  ##.#     #",
     "######.##  #HH#  ##.######",
     "      .   #HHHH#   .      ",
     "######.##  ####  ##.######",
     "     #.##        ##.#     #",
     "     #.##  ####  ##.#     #",
     "######.##  ####  ##.######",
     "#............##............#",
     "#.####.#####.##.#####.###.#",
     "#o..##.....o..##..o....##o#",
     "###.##.##.##..#.##.##.##.###",
     "#....##....##.##....##....#",
     "#.######.###..#.###.#####.#",
     "#..##.......#..#.......##..#",
     "#.##.####.####.####.##.#..#",
     "#o##..##..##......##..##o#",
     "#.##.#.#####.#..#####.##..#",
     "#.##.#.####..#..#####.##..#",
     "#............##............#",
     "############################"]
  ]
}

export default ChompyGame;
