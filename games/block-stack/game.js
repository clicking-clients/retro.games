/**
 * Block Stack Game Implementation
 * A Tetris-style block stacking game using the new component system
 */

export class BlockStackGame {
  constructor(gameContainer) {
    this.container = gameContainer;
    this.canvas = gameContainer.getCanvas();
    this.ctx = gameContainer.getContext();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.lives = 3;
    
    // Game settings
    this.gridWidth = 10;
    this.gridHeight = 20;
    this.blockSize = 24;
    this.dropSpeed = 1000; // milliseconds
    this.speedIncrease = 50;
    
    // Game grid
    this.grid = this.createGrid();
    
    // Current piece
    this.currentPiece = null;
    this.nextPiece = null;
    
    // Game loop
    this.gameLoop = null;
    this.lastDrop = 0;
    
    // Input handling
    this.keys = new Set();
    this.setupInputHandling();
    
    // Tetromino pieces
    this.pieces = this.createPieces();
    
    // Bind methods
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.gameOver = this.gameOver.bind(this);
  }
  
  /**
   * Initialize the game
   */
  async init() {
    console.log('Initializing Block Stack game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Block Stack game initialized successfully');
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
    // Prevent default behavior for game keys
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'z', 'Z'].includes(e.key)) {
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
        this.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        this.movePiece(1, 0);
        break;
      case 'ArrowDown':
        this.movePiece(0, 1);
        break;
      case 'ArrowUp':
      case 'z':
      case 'Z':
        this.rotatePiece();
        break;
      case ' ':
        this.hardDrop();
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
      case 'ArrowLeft':
        this.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        this.movePiece(1, 0);
        break;
      case 'ArrowDown':
        this.movePiece(0, 1);
        break;
      case 'ArrowUp':
        this.rotatePiece();
        break;
    }
  }
  
  /**
   * Create game grid
   */
  createGrid() {
    const grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        grid[y][x] = 0;
      }
    }
    return grid;
  }
  
  /**
   * Create tetromino pieces
   */
  createPieces() {
    return {
      I: {
        shape: [
          [1, 1, 1, 1]
        ],
        color: '#00f0f0'
      },
      O: {
        shape: [
          [1, 1],
          [1, 1]
        ],
        color: '#f0f000'
      },
      T: {
        shape: [
          [0, 1, 0],
          [1, 1, 1]
        ],
        color: '#a000f0'
      },
      S: {
        shape: [
          [0, 1, 1],
          [1, 1, 0]
        ],
        color: '#00f000'
      },
      Z: {
        shape: [
          [1, 1, 0],
          [0, 1, 1]
        ],
        color: '#f00000'
      },
      J: {
        shape: [
          [1, 0, 0],
          [1, 1, 1]
        ],
        color: '#0000f0'
      },
      L: {
        shape: [
          [0, 0, 1],
          [1, 1, 1]
        ],
        color: '#f0a000'
      }
    };
  }
  
  /**
   * Create new piece
   */
  createPiece() {
    const pieceTypes = Object.keys(this.pieces);
    const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    const piece = this.pieces[randomType];
    
    return {
      type: randomType,
      shape: piece.shape,
      color: piece.color,
      x: Math.floor(this.gridWidth / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0
    };
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
    
    // Auto-drop piece
    if (now - this.lastDrop > this.dropSpeed) {
      this.movePiece(0, 1);
      this.lastDrop = now;
    }
    
    // Render
    this.render();
  }
  
  /**
   * Move current piece
   */
  movePiece(dx, dy) {
    if (!this.currentPiece) return;
    
    const newX = this.currentPiece.x + dx;
    const newY = this.currentPiece.y + dy;
    
    if (this.isValidMove(this.currentPiece.shape, newX, newY)) {
      this.currentPiece.x = newX;
      this.currentPiece.y = newY;
      return true;
    } else if (dy > 0) {
      // Piece landed
      this.placePiece();
      this.clearLines();
      this.spawnNewPiece();
      return false;
    }
    
    return false;
  }
  
  /**
   * Rotate current piece
   */
  rotatePiece() {
    if (!this.currentPiece) return;
    
    const rotated = this.rotateMatrix(this.currentPiece.shape);
    
    if (this.isValidMove(rotated, this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.shape = rotated;
    }
  }
  
  /**
   * Hard drop piece
   */
  hardDrop() {
    if (!this.currentPiece) return;
    
    while (this.movePiece(0, 1)) {
      // Keep dropping until it lands
    }
  }
  
  /**
   * Rotate matrix
   */
  rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = [];
    
    for (let i = 0; i < cols; i++) {
      rotated[i] = [];
      for (let j = 0; j < rows; j++) {
        rotated[i][j] = matrix[rows - 1 - j][i];
      }
    }
    
    return rotated;
  }
  
  /**
   * Check if move is valid
   */
  isValidMove(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          
          if (newX < 0 || newX >= this.gridWidth || 
              newY >= this.gridHeight ||
              (newY >= 0 && this.grid[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  }
  
  /**
   * Place piece on grid
   */
  placePiece() {
    if (!this.currentPiece) return;
    
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const gridX = this.currentPiece.x + col;
          const gridY = this.currentPiece.y + row;
          
          if (gridY >= 0) {
            this.grid[gridY][gridX] = this.currentPiece.color;
          }
        }
      }
    }
  }
  
  /**
   * Clear completed lines
   */
  clearLines() {
    let linesCleared = 0;
    
    for (let y = this.gridHeight - 1; y >= 0; y--) {
      if (this.isLineComplete(y)) {
        this.grid.splice(y, 1);
        this.grid.unshift(new Array(this.gridWidth).fill(0));
        linesCleared++;
        y++; // Check the same line again
      }
    }
    
    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += this.calculateScore(linesCleared);
      this.level = Math.floor(this.lines / 10) + 1;
      
      // Update displays
      this.container.updateScore(this.score);
      this.container.updateLives(this.level); // Reusing lives display for level
      
      // Increase speed
      this.dropSpeed = Math.max(100, 1000 - (this.level - 1) * this.speedIncrease);
      
      // Play sound if available
      if (this.container.audio && typeof this.container.audio.beep === 'function') {
        this.container.audio.beep(800, 100, 'square', 0.3);
      }
    }
  }
  
  /**
   * Check if line is complete
   */
  isLineComplete(y) {
    return this.grid[y].every(cell => cell !== 0);
  }
  
  /**
   * Calculate score for lines cleared
   */
  calculateScore(lines) {
    const baseScore = 100;
    const multiplier = [1, 3, 5, 8]; // Single, double, triple, tetris
    return baseScore * multiplier[lines - 1] * this.level;
  }
  
  /**
   * Spawn new piece
   */
  spawnNewPiece() {
    this.currentPiece = this.nextPiece || this.createPiece();
    this.nextPiece = this.createPiece();
    
    // Check if new piece can be placed
    if (!this.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
      this.gameOver();
    }
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
    
    // Draw current piece
    if (this.currentPiece) {
      this.drawPiece(this.currentPiece);
    }
    
    // Draw next piece preview
    if (this.nextPiece) {
      this.drawNextPiece();
    }
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw the game grid
   */
  drawGrid() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.grid[y][x]) {
          this.drawBlock(x, y, this.grid[y][x]);
        }
      }
    }
  }
  
  /**
   * Draw a block
   */
  drawBlock(x, y, color) {
    const pixelX = x * this.blockSize;
    const pixelY = y * this.blockSize;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
    
    // Add highlight
    this.ctx.fillStyle = this.lightenColor(color, 0.3);
    this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, 2);
    this.ctx.fillRect(pixelX + 1, pixelY + 1, 2, this.blockSize - 2);
    
    // Add shadow
    this.ctx.fillStyle = this.darkenColor(color, 0.3);
    this.ctx.fillRect(pixelX + this.blockSize - 3, pixelY + 1, 2, this.blockSize - 2);
    this.ctx.fillRect(pixelX + 1, pixelY + this.blockSize - 3, this.blockSize - 2, 2);
  }
  
  /**
   * Draw a piece
   */
  drawPiece(piece) {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const x = piece.x + col;
          const y = piece.y + row;
          
          if (y >= 0) {
            this.drawBlock(x, y, piece.color);
          }
        }
      }
    }
  }
  
  /**
   * Draw next piece preview
   */
  drawNextPiece() {
    const previewX = this.gridWidth * this.blockSize + 20;
    const previewY = 100;
    
    // Draw preview background
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    this.ctx.fillRect(previewX - 10, previewY - 10, 120, 80);
    this.ctx.strokeStyle = '#0f0';
    this.ctx.strokeRect(previewX - 10, previewY - 10, 120, 80);
    
    // Draw next piece
    for (let row = 0; row < this.nextPiece.shape.length; row++) {
      for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
        if (this.nextPiece.shape[row][col]) {
          const x = previewX + col * 20;
          const y = previewY + row * 20;
          
          this.ctx.fillStyle = this.nextPiece.color;
          this.ctx.fillRect(x, y, 18, 18);
        }
      }
    }
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
    this.ctx.fillText(`Lines: ${this.lines}`, 10, 40);
    this.ctx.fillText(`Level: ${this.level}`, 10, 60);
    
    // Draw next piece label
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Next:', this.gridWidth * this.blockSize + 20, 80);
  }
  
  /**
   * Lighten color
   */
  lightenColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
  
  /**
   * Darken color
   */
  darkenColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
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
    this.ctx.fillText('BLOCK STACK', this.canvas.width / 2, this.canvas.height / 2 - 40);
    
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText('Arrow keys to move, Z to rotate', this.canvas.width / 2, this.canvas.height / 2 + 30);
    
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
    this.lines = 0;
    this.level = 1;
    this.dropSpeed = 1000;
    this.grid = this.createGrid();
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
    this.lastDrop = Date.now();
    
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
    
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '20px monospace';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(`Lines Cleared: ${this.lines}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    this.ctx.fillText(`Level Reached: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
    
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Press SPACE to play again', this.canvas.width / 2, this.canvas.height / 2 + 100);
    this.ctx.fillText('Press H to go home', this.canvas.width / 2, this.canvas.height / 2 + 130);
    
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

export default BlockStackGame;
