/**
 * Word Defenders Game Implementation
 * A word puzzle game using the new component system
 */

export class WordDefendersGame {
  constructor(gameContainer) {
    this.container = gameContainer;
    this.canvas = gameContainer.getCanvas();
    this.ctx = gameContainer.getContext();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    
    // Game settings
    this.words = ['HELLO', 'WORLD', 'GAME', 'PLAY', 'FUN', 'CODE', 'WEB', 'APP'];
    this.currentWord = '';
    this.letters = [];
    this.fallingLetters = [];
    
    // Game loop
    this.gameLoop = null;
    this.lastUpdate = 0;
    
    // Input handling
    this.typedWord = '';
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
    console.log('Initializing Word Defenders game...');
    
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
    
    console.log('Word Defenders game initialized successfully');
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
    // Listen for key presses to build words
    document.addEventListener('keypress', (e) => {
      if (this.gameState === 'playing' && e.key.match(/[A-Za-z]/)) {
        this.typedWord += e.key.toUpperCase();
        this.checkWord();
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
      case 'Backspace':
        this.typedWord = this.typedWord.slice(0, -1);
        break;
      case 'Enter':
        this.typedWord = '';
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
      case ' ':
        this.togglePause();
        break;
    }
  }
  
  /**
   * Initialize the game
   */
  initializeGame() {
    this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
    this.letters = this.currentWord.split('');
    this.fallingLetters = [];
    this.typedWord = '';
    
    // Create falling letters
    for (let i = 0; i < this.letters.length; i++) {
      this.fallingLetters.push({
        letter: this.letters[i],
        x: Math.random() * (this.canvas.width - 40),
        y: -50 - i * 30,
        speed: 1 + Math.random() * 2
      });
    }
  }
  
  /**
   * Check if typed word matches
   */
  checkWord() {
    if (this.typedWord === this.currentWord) {
      this.score += 100 * this.level;
      this.container.updateScore(this.score);
      
      // Clear falling letters
      this.fallingLetters = this.fallingLetters.filter(letter => 
        !this.letters.includes(letter.letter)
      );
      
      // Next word
      this.level++;
      this.initializeGame();
      
      console.log(`Word completed! Score: ${this.score}`);
    }
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.update();
    }, 50); // 20 FPS - appropriate for word game
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
    
    // Update falling letters
    this.fallingLetters.forEach(letter => {
      letter.y += letter.speed;
      
      // Check if letter reached bottom
      if (letter.y > this.canvas.height) {
        this.lives--;
        this.container.updateLives(this.lives);
        
        if (this.lives <= 0) {
          this.gameOver();
          return;
        }
      }
    });
    
    // Remove letters that reached bottom
    this.fallingLetters = this.fallingLetters.filter(letter => letter.y <= this.canvas.height);
    
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
    
    // Draw current word
    this.drawCurrentWord();
    
    // Draw falling letters
    this.drawFallingLetters();
    
    // Draw typed word
    this.drawTypedWord();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw the current word to spell
   */
  drawCurrentWord() {
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.currentWord, this.canvas.width / 2, 50);
  }
  
  /**
   * Draw falling letters
   */
  drawFallingLetters() {
    this.ctx.font = '20px monospace';
    this.ctx.textAlign = 'center';
    
    this.fallingLetters.forEach(letter => {
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(letter.letter, letter.x + 20, letter.y + 20);
      
      // Draw letter box
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(letter.x, letter.y, 40, 40);
    });
  }
  
  /**
   * Draw the typed word
   */
  drawTypedWord() {
    this.ctx.fillStyle = '#ff0';
    this.ctx.font = '18px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Typed: ${this.typedWord}`, this.canvas.width / 2, this.canvas.height - 50);
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
    
    // Draw instructions
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Type the word before letters reach bottom!', this.canvas.width / 2, this.canvas.height - 20);
  }
  
  /**
   * Show the main menu
   */
  showMenu() {
    this.gameState = 'menu';
    this.render();
    
    // Draw menu text
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('WORD DEFENDERS', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Type words before letters reach bottom', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('Use keyboard to type the target word', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
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

export default WordDefendersGame;
