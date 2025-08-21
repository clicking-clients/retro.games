/**
 * Number Defenders Game Implementation
 * A math problem solving game with rockets using the new component system
 * This preserves ALL the original game logic and workings
 */

export class NumberDefendersGame {
  constructor(gameContainer) {
    this.container = gameContainer;
    this.canvas = gameContainer.getCanvas();
    this.ctx = gameContainer.getContext();
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.paused = false;
    
    // Game settings
    this.scale = 20;
    this.rows = this.canvas.height / this.scale;
    this.cols = this.canvas.width / this.scale;
    
    // Game configuration
    this.speed = 2;
    this.lanes = 4;
    this.timer = 3;
    this.timerEnabled = true;
    this.mode = 'both'; // both, +, -
    this.allowNegative = false;
    
    // Game objects
    this.problems = [];
    this.rockets = [];
    this.player = { x: Math.floor(this.cols/2), y: this.rows - 2, width: 2, height: 2 };
    
    // Game loop
    this.gameLoop = null;
    this.lastUpdate = 0;
    this.gameTimer = 0;
    
    // Input handling
    this.keys = new Set();
    this.currentInput = '';
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
    console.log('Initializing Number Defenders game...');
    
    // Setup canvas
    this.setupCanvas();
    
    // Setup game container events
    this.setupGameEvents();
    
    // Initialize game
    this.initProblems();
    
    // Start game loop
    this.startGameLoop();
    
    // Show menu
    this.showMenu();
    
    console.log('Number Defenders game initialized successfully');
  }
  
  /**
   * Setup canvas and context
   */
  setupCanvas() {
    this.canvas.width = this.container.config.canvasWidth;
    this.canvas.height = this.container.config.canvasHeight;
    
    // Set canvas style for pixel-perfect rendering
    this.canvas.style.imageRendering = 'pixelated';
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
    // Listen for number input
    document.addEventListener('keypress', (e) => {
      if (this.gameState === 'playing' && e.key.match(/[0-9\-]/)) {
        this.currentInput += e.key;
        this.checkAnswer();
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
        this.movePlayer(-1);
        break;
      case 'ArrowRight':
        this.movePlayer(1);
        break;
      case 'Backspace':
        this.currentInput = this.currentInput.slice(0, -1);
        break;
      case 'Enter':
        this.currentInput = '';
        break;
      case ' ':
        this.togglePause();
        break;
      case 'r':
      case 'R':
        this.resetLevel();
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
        this.movePlayer(-1);
        break;
      case 'ArrowRight':
        this.movePlayer(1);
        break;
      case ' ':
        this.togglePause();
        break;
    }
  }
  
  /**
   * Move player
   */
  movePlayer(dx) {
    const newX = this.player.x + dx;
    if (newX >= 0 && newX <= this.cols - this.player.width) {
      this.player.x = newX;
    }
  }
  
  /**
   * Initialize math problems
   */
  initProblems() {
    this.problems = [];
    this.rockets = [];
    
    for (let i = 0; i < this.lanes; i++) {
      const problem = this.generateProblem();
      this.problems.push({
        x: i * (this.cols / this.lanes) + (this.cols / this.lanes) / 2,
        y: -2,
        problem: problem.problem,
        answer: problem.answer,
        lane: i,
        speed: this.speed * 0.1
      });
    }
  }
  
  /**
   * Generate a math problem
   */
  generateProblem() {
    let a, b, answer, problem;
    
    switch (this.mode) {
      case '+':
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        answer = a + b;
        problem = `${a} + ${b}`;
        break;
      case '-':
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        problem = `${a} - ${b}`;
        break;
      default: // both
        if (Math.random() > 0.5) {
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * 20) + 1;
          answer = a + b;
          problem = `${a} + ${b}`;
        } else {
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * a) + 1;
          answer = a - b;
          problem = `${a} - ${b}`;
        }
    }
    
    return { problem, answer };
  }
  
  /**
   * Check if input matches answer
   */
  checkAnswer() {
    const inputNum = parseInt(this.currentInput);
    if (isNaN(inputNum)) return;
    
    // Find problem in player's lane
    const playerLane = Math.floor(this.player.x / (this.cols / this.lanes));
    const problem = this.problems.find(p => p.lane === playerLane);
    
    if (problem && inputNum === problem.answer) {
      // Correct answer!
      this.score += 10;
      this.container.updateScore(this.score);
      
      // Remove problem and create rocket effect
      this.problems = this.problems.filter(p => p !== problem);
      this.createRocket(problem.x, problem.y);
      
      // Generate new problem
      const newProblem = this.generateProblem();
      this.problems.push({
        x: problem.x,
        y: -2,
        problem: newProblem.problem,
        answer: newProblem.answer,
        lane: problem.lane,
        speed: this.speed * 0.1
      });
      
      this.currentInput = '';
      console.log(`Correct! ${problem.problem} = ${problem.answer}`);
    }
  }
  
  /**
   * Create rocket effect
   */
  createRocket(x, y) {
    this.rockets.push({
      x: x,
      y: y,
      particles: []
    });
    
    // Create particle explosion
    for (let i = 0; i < 10; i++) {
      this.rockets[this.rockets.length - 1].particles.push({
        x: x,
        y: y,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        life: 1.0
      });
    }
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.update();
    }, 50); // 20 FPS - appropriate for math game
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
    
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;
    
    // Update timer
    if (this.timerEnabled) {
      this.gameTimer += deltaTime / 1000;
      if (this.gameTimer >= this.timer) {
        this.gameOver();
        return;
      }
    }
    
    // Update problems
    this.updateProblems();
    
    // Update rockets
    this.updateRockets();
    
    // Check collisions
    this.checkCollisions();
    
    // Render
    this.render();
  }
  
  /**
   * Update problems
   */
  updateProblems() {
    this.problems.forEach(problem => {
      problem.y += problem.speed;
      
      // Check if problem reached bottom
      if (problem.y > this.rows) {
        this.lives--;
        this.container.updateLives(this.lives);
        
        if (this.lives <= 0) {
          this.gameOver();
          return;
        }
        
        // Reset problem to top
        problem.y = -2;
      }
    });
  }
  
  /**
   * Update rockets
   */
  updateRockets() {
    this.rockets.forEach(rocket => {
      rocket.particles.forEach(particle => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life -= 0.02;
      });
      
      // Remove dead particles
      rocket.particles = rocket.particles.filter(p => p.life > 0);
    });
    
    // Remove rockets with no particles
    this.rockets = this.rockets.filter(r => r.particles.length > 0);
  }
  
  /**
   * Check collisions
   */
  checkCollisions() {
    // Check if player is in correct lane for problems
    this.problems.forEach(problem => {
      const playerLane = Math.floor(this.player.x / (this.cols / this.lanes));
      if (problem.lane === playerLane && 
          problem.y + 1 >= this.player.y && 
          problem.y <= this.player.y + this.player.height) {
        // Problem hit player
        this.lives--;
        this.container.updateLives(this.lives);
        
        if (this.lives <= 0) {
          this.gameOver();
          return;
        }
        
        // Reset problem
        problem.y = -2;
      }
    });
  }
  
  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw lanes
    this.drawLanes();
    
    // Draw problems
    this.drawProblems();
    
    // Draw rockets
    this.drawRockets();
    
    // Draw player
    this.drawPlayer();
    
    // Draw UI
    this.drawUI();
  }
  
  /**
   * Draw lane dividers
   */
  drawLanes() {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    for (let i = 1; i < this.lanes; i++) {
      const x = (this.cols / this.lanes) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.scale, 0);
      this.ctx.lineTo(x * this.scale, this.canvas.height);
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw math problems
   */
  drawProblems() {
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    
    this.problems.forEach(problem => {
      this.ctx.fillStyle = '#f00';
      this.ctx.fillText(problem.problem, problem.x * this.scale, problem.y * this.scale);
      
      // Problem box
      this.ctx.strokeStyle = '#f00';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        problem.x * this.scale - 20,
        problem.y * this.scale - 20,
        40,
        40
      );
    });
  }
  
  /**
   * Draw rocket effects
   */
  drawRockets() {
    this.rockets.forEach(rocket => {
      rocket.particles.forEach(particle => {
        this.ctx.fillStyle = `rgba(255, 255, 0, ${particle.life})`;
        this.ctx.beginPath();
        this.ctx.arc(
          particle.x * this.scale,
          particle.y * this.scale,
          3,
          0,
          2 * Math.PI
        );
        this.ctx.fill();
      });
    });
  }
  
  /**
   * Draw player
   */
  drawPlayer() {
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillRect(
      this.player.x * this.scale,
      this.player.y * this.scale,
      this.player.width * this.scale,
      this.player.height * this.scale
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
    
    // Draw timer
    if (this.timerEnabled) {
      const timeLeft = Math.max(0, this.timer - this.gameTimer);
      this.ctx.fillText(`Time: ${Math.floor(timeLeft)}s`, 10, 80);
    }
    
    // Draw current input
    this.ctx.fillStyle = '#ff0';
    this.ctx.font = '18px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Input: ${this.currentInput}`, this.canvas.width / 2, this.canvas.height - 40);
    
    // Draw instructions
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Move to lane and type the answer!', this.canvas.width / 2, this.canvas.height - 20);
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
    this.ctx.fillText('NUMBER DEFENDERS', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Solve math problems before they reach you!', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('Use arrow keys to move, type numbers to solve', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
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
    this.gameTimer = 0;
    this.currentInput = '';
    
    this.initProblems();
    
    // Update displays
    this.container.updateScore(this.score);
    this.container.updateLives(this.lives);
  }
  
  /**
   * Reset current level
   */
  resetLevel() {
    this.initProblems();
    this.gameTimer = 0;
    this.currentInput = '';
  }
  
  /**
   * Pause the game
   */
  pause() {
    if (this.gameState === 'playing') {
      this.paused = true;
      this.container.showStatus('Game Paused - Press SPACE to resume', 'warning');
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

export default NumberDefendersGame;
