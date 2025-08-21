/**
 * Pipe Dream Game Implementation
 * A pipe connection puzzle game using the new component system
 */

export class PipeDreamGame {
  constructor(gameContainer) {
    this.container = gameContainer;
    this.canvas = gameContainer.getCanvas();
    this.ctx = gameContainer.getContext();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.level = 1;
    this.timeLeft = 60; // seconds
    
    // Game settings
    this.gridSize = 8;
    this.tileSize = 40;
    this.pipes = [];
    this.flowPath = [];
    
    // Game loop
    this.gameLoop = null;
    this.lastUpdate = 0;
    
    // Input handling
    this.selectedPipe = null;
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
    console.log('Initializing Pipe Dream game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Initialize game board
    this.initializeBoard();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Pipe Dream game initialized successfully');
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
    // Mouse events for pipe selection and rotation
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
  }
  
  /**
   * Handle key down events
   */
  handleKeyDown(e) {
    if (this.gameState !== 'playing') return;
    
    const key = e.key;
    
    switch (key) {
      case ' ':
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
      case ' ':
        this.togglePause();
        break;
      case 'r':
      case 'R':
        this.restart();
        break;
    }
  }
  
  /**
   * Handle mouse click
   */
  handleClick(e) {
    if (this.gameState !== 'playing') return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);
    
    if (gridX >= 0 && gridX < this.gridSize && gridY >= 0 && gridY < this.gridSize) {
      this.selectPipe(gridX, gridY);
    }
  }
  
  /**
   * Handle mouse down
   */
  handleMouseDown(e) {
    if (this.gameState !== 'playing') return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);
    
    if (gridX >= 0 && gridX < this.gridSize && gridY >= 0 && gridY < this.gridSize) {
      this.rotatePipe(gridX, gridY);
    }
  }
  
  /**
   * Initialize the game board
   */
  initializeBoard() {
    this.pipes = [];
    
    // Create a simple pipe layout
    for (let y = 0; y < this.gridSize; y++) {
      this.pipes[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        if (x === 0 && y === 0) {
          // Start pipe
          this.pipes[y][x] = { type: 'start', rotation: 0, connections: ['right'] };
        } else if (x === this.gridSize - 1 && y === this.gridSize - 1) {
          // End pipe
          this.pipes[y][x] = { type: 'end', rotation: 0, connections: ['left'] };
        } else if (Math.random() < 0.3) {
          // Random pipe
          const types = ['straight', 'corner', 't-junction'];
          const type = types[Math.floor(Math.random() * types.length)];
          this.pipes[y][x] = { type, rotation: 0, connections: this.getPipeConnections(type) };
        } else {
          // Empty space
          this.pipes[y][x] = null;
        }
      }
    }
  }
  
  /**
   * Get pipe connections based on type
   */
  getPipeConnections(type) {
    switch (type) {
      case 'straight':
        return ['left', 'right'];
      case 'corner':
        return ['left', 'down'];
      case 't-junction':
        return ['left', 'right', 'down'];
      default:
        return [];
    }
  }
  
  /**
   * Select a pipe
   */
  selectPipe(x, y) {
    if (this.pipes[y] && this.pipes[y][x]) {
      this.selectedPipe = { x, y };
      console.log(`Selected pipe at (${x}, ${y}): ${this.pipes[y][x].type}`);
    }
  }
  
  /**
   * Rotate a pipe
   */
  rotatePipe(x, y) {
    if (this.pipes[y] && this.pipes[y][x]) {
      this.pipes[y][x].rotation = (this.pipes[y][x].rotation + 90) % 360;
      console.log(`Rotated pipe at (${x}, ${y}) to ${this.pipes[y][x].rotation}°`);
      
      // Check if path is complete
      this.checkPath();
    }
  }
  
  /**
   * Check if the pipe path is complete
   */
  checkPath() {
    // Simple path checking - in a real game this would be more complex
    let pathComplete = false;
    
    // Check if start and end are connected
    if (this.pipes[0][0] && this.pipes[this.gridSize - 1][this.gridSize - 1]) {
      // For now, just check if there are enough pipes
      let pipeCount = 0;
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          if (this.pipes[y][x]) pipeCount++;
        }
      }
      
      if (pipeCount >= this.gridSize * 2) {
        pathComplete = true;
      }
    }
    
    if (pathComplete) {
      this.levelComplete();
    }
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.update();
    }, 100); // 10 FPS - appropriate for puzzle game
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
    
    // Update timer
    this.timeLeft -= deltaTime / 1000;
    if (this.timeLeft <= 0) {
      this.gameOver();
      return;
    }
    
    // Render
    this.render();
  }
  
  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw pipes
    this.drawPipes();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw the game grid
   */
  drawGrid() {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x <= this.gridSize; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.tileSize, 0);
      this.ctx.lineTo(x * this.tileSize, this.gridSize * this.tileSize);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= this.gridSize; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.tileSize);
      this.ctx.lineTo(this.gridSize * this.tileSize, y * this.tileSize);
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw the pipes
   */
  drawPipes() {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const pipe = this.pipes[y][x];
        if (pipe) {
          this.drawPipe(x, y, pipe);
        }
      }
    }
  }
  
  /**
   * Draw a single pipe
   */
  drawPipe(x, y, pipe) {
    const centerX = x * this.tileSize + this.tileSize / 2;
    const centerY = y * this.tileSize + this.tileSize / 2;
    const radius = this.tileSize / 3;
    
    // Pipe color based on type
    let color = '#666';
    if (pipe.type === 'start') color = '#0f0';
    else if (pipe.type === 'end') color = '#f00';
    
    // Highlight selected pipe
    if (this.selectedPipe && this.selectedPipe.x === x && this.selectedPipe.y === y) {
      this.ctx.strokeStyle = '#ff0';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }
    
    // Draw pipe base
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.tileSize + 2, y * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Draw pipe connections
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;
    
    pipe.connections.forEach(connection => {
      let startX, startY, endX, endY;
      
      switch (connection) {
        case 'left':
          startX = x * this.tileSize + 2;
          startY = centerY;
          endX = centerX - radius;
          endY = centerY;
          break;
        case 'right':
          startX = centerX + radius;
          startY = centerY;
          endX = (x + 1) * this.tileSize - 2;
          endY = centerY;
          break;
        case 'up':
          startX = centerX;
          startY = y * this.tileSize + 2;
          endX = centerX;
          endY = centerY - radius;
          break;
        case 'down':
          startX = centerX;
          startY = centerY + radius;
          endX = centerX;
          endY = (y + 1) * this.tileSize - 2;
          break;
      }
      
      if (startX && startY && endX && endY) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
      }
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
    this.ctx.fillText(`Time: ${Math.max(0, Math.floor(this.timeLeft))}s`, 10, 60);
    
    // Draw instructions
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Click to select, right-click to rotate', this.canvas.width / 2, this.canvas.height - 20);
  }
  
  /**
   * Show the main menu
   */
  showMenu() {
    this.gameState = 'menu';
    this.render();
    
    // Draw menu text
    this.ctx.fillStyle = '#ff8c00';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PIPE DREAM', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Connect pipes to complete the path', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('Click pipes to select, rotate to connect', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
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
    this.timeLeft = 60;
    
    this.initializeBoard();
    
    // Update displays
    this.container.updateScore(this.score);
    this.container.updateLives(this.level);
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
   * Handle level completion
   */
  levelComplete() {
    this.level++;
    this.score += 1000;
    this.container.updateScore(this.score);
    
    // Increase difficulty
    this.timeLeft = Math.max(30, 60 - (this.level - 1) * 5);
    
    // Reset level
    this.initializeBoard();
    
    // Show level complete message
    this.container.showStatus(`Level ${this.level - 1} Complete!`, 'success');
    setTimeout(() => this.container.hideStatus(), 2000);
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

export default PipeDreamGame;
