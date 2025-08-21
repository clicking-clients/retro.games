/**
 * Game Loader System
 * Handles initialization, module loading, and error handling for all games
 */

import { GameContainer } from '../components/GameContainer.js';
import { GAME_CONFIGS, GameConfigManager } from '../config/games.js';

export class GameLoader {
  constructor() {
    this.currentGame = null;
    this.loadedModules = new Map();
    this.errorBoundary = null;
    this.loadingIndicator = null;
    this.isInitialized = false;
  }
  
  /**
   * Initialize the game loader
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      this.setupErrorBoundary();
      this.setupLoadingIndicator();
      this.detectGameFromURL();
      await this.loadCurrentGame();
      this.setupGlobalEventListeners();
      
      this.isInitialized = true;
      console.log('Game Loader initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Game Loader:', error);
      this.showError('Failed to initialize game system', error);
    }
  }
  
  /**
   * Detect which game to load from URL
   */
  detectGameFromURL() {
    const path = window.location.pathname;
    console.log('Full path:', path);
    
    // Extract game ID from path like /games/block-stack/index.html
    const pathParts = path.split('/');
    let gameId = null;
    
    // Look for the games directory and get the next part
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i] === 'games' && i + 1 < pathParts.length) {
        gameId = pathParts[i + 1];
        break;
      }
    }
    
    console.log('Extracted game ID:', gameId);
    
    if (gameId && GAME_CONFIGS[gameId]) {
      this.currentGameId = gameId;
    } else {
      // Default to first game if none specified
      this.currentGameId = Object.keys(GAME_CONFIGS)[0];
      console.warn(`Game ID '${gameId}' not found in configs, defaulting to: ${this.currentGameId}`);
    }
    
    console.log(`Detected game: ${this.currentGameId}`);
  }
  
  /**
   * Load the current game
   */
  async loadCurrentGame() {
    if (!this.currentGameId) {
      throw new Error('No game ID specified');
    }
    
    const gameConfig = GAME_CONFIGS[this.currentGameId];
    if (!gameConfig) {
      throw new Error(`Game configuration not found: ${this.currentGameId}`);
    }
    
    try {
      this.showLoading();
      
      // Create game container
      this.currentGame = new GameContainer(gameConfig);
      
      // Setup event listeners
      this.setupGameEventListeners();
      
      // Initialize the game
      await this.currentGame.init();
      
      // Load game-specific logic
      await this.loadGameLogic(gameConfig);
      
      this.hideLoading();
      
      // Focus the canvas for keyboard input
      this.currentGame.getCanvas().focus();
      
      console.log(`Game loaded successfully: ${gameConfig.title}`);
      
    } catch (error) {
      console.error(`Failed to load game: ${this.currentGameId}`, error);
      this.showError(`Failed to load ${gameConfig.title}`, error);
    }
  }
  
  /**
   * Load game-specific logic
   */
  async loadGameLogic(gameConfig) {
    try {
      const gameModule = await import(`../games/${gameConfig.id}/game.js`);
      const GameClass = gameModule.default || gameModule.Game || gameModule;
      
      if (typeof GameClass === 'function') {
        // Initialize the game class
        const gameInstance = new GameClass(this.currentGame);
        if (typeof gameInstance.init === 'function') {
          await gameInstance.init();
        }
        
        // Store reference to game instance
        this.currentGame.gameInstance = gameInstance;
        
        console.log(`Game logic loaded: ${gameConfig.title}`);
      } else {
        console.warn(`No game class found for: ${gameConfig.title}`);
      }
    } catch (error) {
      console.warn(`Failed to load game logic for ${gameConfig.title}:`, error);
      // Continue without game logic - basic container will still work
    }
  }
  
  /**
   * Setup event listeners for the current game
   */
  setupGameEventListeners() {
    if (!this.currentGame) return;
    
    // Game events
    this.currentGame.on('initialized', () => {
      console.log('Game container initialized');
    });
    
    this.currentGame.on('moduleLoaded', ({ name, module }) => {
      console.log(`Module loaded: ${name}`);
      this.loadedModules.set(name, module);
    });
    
    this.currentGame.on('scoreUpdate', (score) => {
      this.updateGameStats('score', score);
    });
    
    this.currentGame.on('livesUpdate', (lives) => {
      this.updateGameStats('lives', lives);
    });
    
    this.currentGame.on('statusShow', ({ message, type }) => {
      console.log(`Game status: ${message} (${type})`);
    });
    
    // Touch control events
    this.currentGame.on('touchcontrol', ({ key, type }) => {
      this.handleTouchControl(key, type);
    });
    
    // Canvas events
    this.currentGame.on('canvasFocus', () => {
      console.log('Canvas focused - keyboard input enabled');
    });
    
    this.currentGame.on('canvasBlur', () => {
      console.log('Canvas blurred - keyboard input disabled');
    });
  }
  
  /**
   * Setup global event listeners
   */
  setupGlobalEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleGlobalKeyboard(e);
    });
    
    // Window events
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
    
    // Visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
  }
  
  /**
   * Handle global keyboard shortcuts
   */
  handleGlobalKeyboard(e) {
    // Escape key to pause/unpause
    if (e.key === 'Escape') {
      e.preventDefault();
      this.togglePause();
    }
    
    // M key to mute/unmute
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      this.toggleMute();
    }
    
    // F key for fullscreen
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      this.toggleFullscreen();
    }
    
    // R key to restart
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      this.restartGame();
    }
    
    // H key to go home
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      this.goHome();
    }
  }
  
  /**
   * Handle touch controls
   */
  handleTouchControl(key, type) {
    if (!this.currentGame || !this.currentGame.gameInstance) return;
    
    // Create synthetic keyboard/mouse events
    if (type === 'keydown') {
      const keyEvent = new KeyboardEvent('keydown', {
        key: key,
        code: `Key${key.replace('Arrow', '')}`,
        bubbles: true
      });
      this.currentGame.getCanvas().dispatchEvent(keyEvent);
    } else if (type === 'keyup') {
      const keyEvent = new KeyboardEvent('keyup', {
        key: key,
        code: `Key${key.replace('Arrow', '')}`,
        bubbles: true
      });
      this.currentGame.getCanvas().dispatchEvent(keyEvent);
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    if (this.currentGame) {
      // Trigger resize event on game instance
      this.currentGame.emit('resize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  }
  
  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Tab is hidden - pause game
      this.pauseGame();
    } else {
      // Tab is visible - resume game
      this.resumeGame();
    }
  }
  
  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.currentGame && this.currentGame.gameInstance) {
      if (this.currentGame.gameInstance.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    }
  }
  
  /**
   * Pause the game
   */
  pauseGame() {
    if (this.currentGame && this.currentGame.gameInstance) {
      if (typeof this.currentGame.gameInstance.pause === 'function') {
        this.currentGame.gameInstance.pause();
      }
      this.currentGame.showStatus('Game Paused', 'warning');
    }
  }
  
  /**
   * Resume the game
   */
  resumeGame() {
    if (this.currentGame && this.currentGame.gameInstance) {
      if (typeof this.currentGame.gameInstance.resume === 'function') {
        this.currentGame.gameInstance.resume();
      }
      this.currentGame.hideStatus();
    }
  }
  
  /**
   * Toggle mute state
   */
  toggleMute() {
    if (this.currentGame && this.currentGame.audio) {
      if (typeof this.currentGame.audio.toggleMute === 'function') {
        this.currentGame.audio.toggleMute();
      }
    }
  }
  
  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.currentGame.getContainer().requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  /**
   * Restart the game
   */
  restartGame() {
    if (this.currentGame && this.currentGame.gameInstance) {
      if (typeof this.currentGame.gameInstance.restart === 'function') {
        this.currentGame.gameInstance.restart();
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    }
  }
  
  /**
   * Go back to home page
   */
  goHome() {
    window.location.href = '../index.html';
  }
  
  /**
   * Update game statistics
   */
  updateGameStats(type, value) {
    // Update UI elements
    const element = document.getElementById(`${type}Value`);
    if (element) {
      element.textContent = value.toString();
    }
    
    // Emit event for analytics
    this.currentGame.emit('statsUpdate', { type, value });
  }
  
  /**
   * Setup error boundary
   */
  setupErrorBoundary() {
    this.errorBoundary = document.getElementById('errorBoundary');
    
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.showError('An unexpected error occurred', event.error);
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showError('A promise was rejected', event.reason);
    });
  }
  
  /**
   * Setup loading indicator
   */
  setupLoadingIndicator() {
    this.loadingIndicator = document.getElementById('loadingIndicator');
  }
  
  /**
   * Show loading indicator
   */
  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'flex';
    }
  }
  
  /**
   * Hide loading indicator
   */
  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
  }
  
  /**
   * Show error message
   */
  showError(message, error) {
    console.error(message, error);
    
    if (this.errorBoundary) {
      const titleElement = this.errorBoundary.querySelector('h2');
      const messageElement = this.errorBoundary.querySelector('p');
      
      if (titleElement) titleElement.textContent = 'Oops! Something went wrong';
      if (messageElement) messageElement.textContent = message;
      
      this.errorBoundary.style.display = 'flex';
    }
    
    // Hide loading indicator
    this.hideLoading();
  }
  
  /**
   * Get current game instance
   */
  getCurrentGame() {
    return this.currentGame;
  }
  
  /**
   * Get loaded module
   */
  getModule(name) {
    return this.loadedModules.get(name);
  }
  
  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.currentGame) {
      this.currentGame.destroy();
      this.currentGame = null;
    }
    
    this.loadedModules.clear();
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.gameLoader = new GameLoader();
  window.gameLoader.init();
});

export default GameLoader;
