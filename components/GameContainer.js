/**
 * GameContainer Component
 * Provides a unified structure for all games in the Retro Games Collection
 */

export class GameContainer {
  constructor(config) {
    this.config = config;
    this.id = config.id;
    this.title = config.title;
    this.maxWidth = config.maxWidth || 1200;
    this.aspectRatio = config.aspectRatio;
    this.canvasWidth = config.canvasWidth;
    this.canvasHeight = config.canvasHeight;
    this.modules = config.modules || [];
    this.controls = config.controls || [];
    this.features = config.features || [];
    
    this.elements = {};
    this.eventListeners = new Map();
    this.isInitialized = false;
  }
  
  /**
   * Initialize the game container
   */
  init() {
    if (this.isInitialized) return;
    
    console.log(`Initializing GameContainer for ${this.title}...`);
    
    this.createContainer();
    this.createGameContent();
    this.createSidebar();
    this.createTouchControls();
    this.setupEventListeners();
    this.loadModules();
    
    this.isInitialized = true;
    this.emit('initialized', this);
    
    console.log(`GameContainer initialized for ${this.title} with LHS/RHS layout`);
    console.log('Game area on left, controls/info on right');
    console.log('Final DOM structure:', this.elements.container.innerHTML);
  }
  
  /**
   * Create the main container
   */
  createContainer() {
    this.elements.container = document.createElement('div');
    this.elements.container.className = 'game-container';
    this.elements.container.dataset.game = this.id;
    this.elements.container.style.maxWidth = `${this.maxWidth}px`;
    
    // Add to body if no parent specified
    if (!this.elements.container.parentElement) {
      document.body.appendChild(this.elements.container);
    }
    
    console.log(`GameContainer created for ${this.title} with maxWidth: ${this.maxWidth}px`);
  }
  
  /**
   * Create the game content area with LHS/RHS layout
   */
  createGameContent() {
    this.elements.gameContent = document.createElement('div');
    this.elements.gameContent.className = 'game-content';
    
    // Create left side game area
    this.elements.gameAreaLhs = document.createElement('div');
    this.elements.gameAreaLhs.className = 'game-area-lhs';
    
    // Create game title
    this.elements.title = document.createElement('h1');
    this.elements.title.className = 'game-title';
    this.elements.title.textContent = this.title;
    this.elements.title.id = 'gameTitle';
    
    // Create game canvas wrapper
    this.elements.canvasWrapper = document.createElement('div');
    this.elements.canvasWrapper.className = 'game-canvas-wrapper';
    
    // Create canvas
    this.elements.canvas = document.createElement('canvas');
    this.elements.canvas.className = 'game-canvas';
    this.elements.canvas.id = 'gameCanvas';
    this.elements.canvas.width = this.canvasWidth;
    this.elements.canvas.height = this.canvasHeight;
    this.elements.canvas.style.aspectRatio = this.aspectRatio;
    this.elements.canvas.setAttribute('tabindex', '0');
    this.elements.canvas.setAttribute('role', 'application');
    this.elements.canvas.setAttribute('aria-label', `${this.title} game canvas`);
    
    // Add canvas to wrapper
    this.elements.canvasWrapper.appendChild(this.elements.canvas);
    
    // Add elements to left side game area
    this.elements.gameAreaLhs.appendChild(this.elements.title);
    this.elements.gameAreaLhs.appendChild(this.elements.canvasWrapper);
    
    // Add left side to game content
    this.elements.gameContent.appendChild(this.elements.gameAreaLhs);
    
    // Add to main container
    this.elements.container.appendChild(this.elements.gameContent);
  }
  
  /**
   * Create the sidebar (RHS)
   */
  createSidebar() {
    this.elements.sidebar = document.createElement('div');
    this.elements.sidebar.className = 'game-sidebar-rhs compact-sidebar';
    
    // Create scoreboard
    this.createScoreboard();
    
    // Create controls section
    this.createControlsSection();
    
    // Create instructions section
    this.createInstructionsSection();
    
    // Add sidebar to game content for LHS/RHS layout
    this.elements.gameContent.appendChild(this.elements.sidebar);
  }
  
  /**
   * Create the scoreboard
   */
  createScoreboard() {
    this.elements.scoreboard = document.createElement('div');
    this.elements.scoreboard.className = 'scoreboard';
    
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = 'Score';
    
    const scoreLabel = document.createElement('div');
    scoreLabel.textContent = 'Score:';
    
    this.elements.scoreValue = document.createElement('div');
    this.elements.scoreValue.className = 'value';
    this.elements.scoreValue.textContent = '0';
    
    const livesLabel = document.createElement('div');
    livesLabel.textContent = 'Lives:';
    
    this.elements.livesValue = document.createElement('div');
    this.elements.livesValue.className = 'value';
    this.elements.livesValue.textContent = '3';
    
    this.elements.scoreboard.appendChild(title);
    this.elements.scoreboard.appendChild(scoreLabel);
    this.elements.scoreboard.appendChild(this.elements.scoreValue);
    this.elements.scoreboard.appendChild(livesLabel);
    this.elements.scoreboard.appendChild(this.elements.livesValue);
    
    this.elements.sidebar.appendChild(this.elements.scoreboard);
  }
  
  /**
   * Create the controls section
   */
  createControlsSection() {
    this.elements.controlsSection = document.createElement('div');
    this.elements.controlsSection.className = 'sidebar-section';
    
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = 'Controls';
    
    this.elements.controlsContent = document.createElement('div');
    this.elements.controlsContent.className = 'game-controls';
    
    // Add control instructions based on game config
    this.controls.forEach(control => {
      const controlInfo = this.getControlInfo(control);
      if (controlInfo) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'control-group';
        
        const label = document.createElement('div');
        label.className = 'control-label';
        label.textContent = controlInfo.name;
        
        const description = document.createElement('div');
        description.className = 'instructions';
        description.textContent = controlInfo.description;
        
        controlDiv.appendChild(label);
        controlDiv.appendChild(description);
        this.elements.controlsContent.appendChild(controlDiv);
      }
    });
    
    this.elements.controlsSection.appendChild(title);
    this.elements.controlsSection.appendChild(this.elements.controlsContent);
    
    this.elements.sidebar.appendChild(this.elements.controlsSection);
  }
  
  /**
   * Create the instructions section
   */
  createInstructionsSection() {
    this.elements.instructionsSection = document.createElement('div');
    this.elements.instructionsSection.className = 'sidebar-section';
    
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = 'How to Play';
    
    this.elements.instructionsContent = document.createElement('div');
    this.elements.instructionsContent.className = 'instructions';
    this.elements.instructionsContent.textContent = this.config.description || 'Have fun playing!';
    
    this.elements.instructionsSection.appendChild(title);
    this.elements.instructionsSection.appendChild(this.elements.instructionsContent);
    
    this.elements.sidebar.appendChild(this.elements.instructionsSection);
  }
  
  /**
   * Create touch controls for mobile
   */
  createTouchControls() {
    this.elements.touchControls = document.createElement('div');
    this.elements.touchControls.className = 'touch-controls';
    
    // Only show touch controls if the game supports them
    if (this.controls.includes('touch')) {
      this.createTouchButtons();
      this.elements.container.appendChild(this.elements.touchControls);
    }
  }
  
  /**
   * Create touch buttons based on game controls
   */
  createTouchButtons() {
    if (this.controls.includes('arrow-keys')) {
      this.createDirectionalTouchControls();
    }
    
    if (this.controls.includes('mouse')) {
      this.createActionTouchControls();
    }
  }
  
  /**
   * Create directional touch controls
   */
  createDirectionalTouchControls() {
    const directions = [
      { key: 'ArrowUp', symbol: '⬆️', label: 'Up' },
      { key: 'ArrowDown', symbol: '⬇️', label: 'Down' },
      { key: 'ArrowLeft', symbol: '⬅️', label: 'Left' },
      { key: 'ArrowRight', symbol: '➡️', label: 'Right' }
    ];
    
    directions.forEach(direction => {
      const button = document.createElement('button');
      button.className = 'touch-button';
      button.setAttribute('aria-label', direction.label);
      button.textContent = direction.symbol;
      
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.emit('touchcontrol', { key: direction.key, type: 'keydown' });
      });
      
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.emit('touchcontrol', { key: direction.key, type: 'keyup' });
      });
      
      this.elements.touchControls.appendChild(button);
    });
  }
  
  /**
   * Create action touch controls
   */
  createActionTouchControls() {
    const actionButton = document.createElement('button');
    actionButton.className = 'touch-button btn-primary';
    actionButton.setAttribute('aria-label', 'Action');
    actionButton.textContent = '🎯';
    
    actionButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.emit('touchcontrol', { key: 'click', type: 'mousedown' });
    });
    
    actionButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.emit('touchcontrol', { key: 'click', type: 'mouseup' });
    });
    
    this.elements.touchControls.appendChild(actionButton);
  }
  
  /**
   * Get control information
   */
  getControlInfo(controlType) {
    const controlSchemes = {
      'arrow-keys': { name: 'Arrow Keys', description: 'Use arrow keys to move' },
      'wasd-arrows': { name: 'WASD + Arrows', description: 'WASD for player 1, arrows for player 2' },
      'mouse': { name: 'Mouse', description: 'Click and drag to interact' },
      'keyboard': { name: 'Keyboard', description: 'Type to play' },
      'touch': { name: 'Touch', description: 'Touch-friendly controls' }
    };
    
    return controlSchemes[controlType] || { name: controlType, description: 'Game controls' };
  }
  
  /**
   * Load required modules
   */
  async loadModules() {
    for (const moduleName of this.modules) {
      try {
        await this.loadModule(moduleName);
      } catch (error) {
        console.warn(`Failed to load module: ${moduleName}`, error);
      }
    }
  }
  
  /**
   * Load a specific module
   */
  async loadModule(moduleName) {
    const moduleMap = {
      audio: '../../core/audio.js',
      fireworks: '../../core/fireworks.js',
      rocket: '../../core/rocket.js'
    };
    
    if (moduleMap[moduleName]) {
      try {
        const module = await import(moduleMap[moduleName]);
        this[moduleName] = module.default || module;
        this.emit('moduleLoaded', { name: moduleName, module: this[moduleName] });
      } catch (error) {
        console.warn(`Module ${moduleName} not available, continuing without it`);
        // Don't fail the game if optional modules aren't available
      }
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Canvas focus management
    this.elements.canvas.addEventListener('focus', () => {
      this.emit('canvasFocus');
    });
    
    this.elements.canvas.addEventListener('blur', () => {
      this.emit('canvasBlur');
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (this.elements.canvas === document.activeElement) {
        this.emit('keydown', e);
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (this.elements.canvas === document.activeElement) {
        this.emit('keyup', e);
      }
    });
    
    // Mouse events
    this.elements.canvas.addEventListener('mousedown', (e) => {
      this.emit('mousedown', e);
    });
    
    this.elements.canvas.addEventListener('mouseup', (e) => {
      this.emit('mouseup', e);
    });
    
    this.elements.canvas.addEventListener('mousemove', (e) => {
      this.emit('mousemove', e);
    });
    
    // Touch events
    this.elements.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.emit('touchstart', e);
    });
    
    this.elements.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.emit('touchend', e);
    });
    
    this.elements.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.emit('touchmove', e);
    });
  }
  
  /**
   * Update score
   */
  updateScore(score) {
    if (this.elements.scoreValue) {
      this.elements.scoreValue.textContent = score.toString();
    }
    this.emit('scoreUpdate', score);
  }
  
  /**
   * Update lives
   */
  updateLives(lives) {
    if (this.elements.livesValue) {
      this.elements.livesValue.textContent = lives.toString();
    }
    this.emit('livesUpdate', lives);
  }
  
  /**
   * Show game status message
   */
  showStatus(message, type = 'info') {
    if (!this.elements.statusMessage) {
      this.elements.statusMessage = document.createElement('div');
      this.elements.statusMessage.className = 'game-status';
      this.elements.container.appendChild(this.elements.statusMessage);
    }
    
    this.elements.statusMessage.innerHTML = `<div class="status-message">${message}</div>`;
    this.elements.statusMessage.className = `game-status status-${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.hideStatus();
    }, 3000);
    
    this.emit('statusShow', { message, type });
  }
  
  /**
   * Hide game status message
   */
  hideStatus() {
    if (this.elements.statusMessage) {
      this.elements.statusMessage.remove();
      this.elements.statusMessage = null;
    }
    this.emit('statusHide');
  }
  
  /**
   * Get canvas context
   */
  getContext() {
    return this.elements.canvas.getContext('2d');
  }
  
  /**
   * Get canvas element
   */
  getCanvas() {
    return this.elements.canvas;
  }
  
  /**
   * Get container element
   */
  getContainer() {
    return this.elements.container;
  }
  
  /**
   * Event emitter
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
  
  /**
   * Add event listener
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }
  
  /**
   * Remove event listener
   */
  off(event, listener) {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Destroy the container
   */
  destroy() {
    // Remove event listeners
    this.eventListeners.clear();
    
    // Remove elements
    if (this.elements.container && this.elements.container.parentElement) {
      this.elements.container.parentElement.removeChild(this.elements.container);
    }
    
    // Clear references
    this.elements = {};
    this.isInitialized = false;
    
    this.emit('destroyed');
  }
}

export default GameContainer;
