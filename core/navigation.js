/**
 * Enhanced Navigation System
 * Integrates with the new component architecture for better mobile experience
 */

import { GAME_CONFIGS, GameConfigManager, GAME_CATEGORIES, DIFFICULTY_LEVELS } from '../config/games.js';

export class EnhancedNavigation {
  constructor() {
    this.currentGameId = null;
    this.navElement = null;
    this.isInitialized = false;
    this.isMobileMenuOpen = false;
    
    // Navigation state
    this.currentCategory = 'all';
    this.currentDifficulty = 'all';
    this.searchQuery = '';
    
    this.init();
  }
  
  /**
   * Initialize the navigation system
   */
  init() {
    if (this.isInitialized) return;
    
    this.detectCurrentGame();
    this.createNavigation();
    this.setupEventListeners();
    this.setupMobileNavigation();
    this.setupSearchAndFilters();
    
    this.isInitialized = true;
    console.log('Enhanced Navigation initialized');
  }
  
  /**
   * Detect which game is currently active
   */
  detectCurrentGame() {
    const path = window.location.pathname;
    const gameId = path.split('/').pop().replace('.html', '');
    
    if (gameId && gameId !== 'index' && GAME_CONFIGS[gameId]) {
      this.currentGameId = gameId;
    }
  }
  
  /**
   * Create the main navigation
   */
  createNavigation() {
    // Find existing navigation or create new one
    this.navElement = document.getElementById('gameNav') || this.createNavElement();
    
    // Create navigation content
    this.createNavigationContent();
    
    // Insert into page if not already present
    if (!this.navElement.parentElement) {
      const firstElement = document.body.firstElementChild;
      if (firstElement) {
        document.body.insertBefore(this.navElement, firstElement);
      }
    }
    
    // If we're on a game page, make navigation more compact
    if (this.currentGameId) {
      this.makeNavigationCompact();
    }
    
    // Initialize collapsed state by default
    this.initCollapsedState();
  }
  
  /**
   * Create navigation element
   */
  createNavElement() {
    const nav = document.createElement('nav');
    nav.id = 'gameNav';
    nav.className = 'game-nav enhanced-nav';
    return nav;
  }
  
  /**
   * Create navigation content
   */
  createNavigationContent() {
    this.navElement.innerHTML = '';
    
    // Mobile toggle button
    this.createMobileToggle();
    
    // Navigation content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'nav-content';
    
    // Navigation header
    this.createNavigationHeader(contentWrapper);
    
    // Search and filters
    this.createSearchAndFilters(contentWrapper);
    
    // Games list
    this.createGamesList(contentWrapper);
    
    // Navigation footer
    this.createNavigationFooter(contentWrapper);
    
    this.navElement.appendChild(contentWrapper);
  }
  
  /**
   * Make navigation more compact for game pages
   */
  makeNavigationCompact() {
    this.navElement.classList.add('compact-nav');
    
    // Reduce header size
    const header = this.navElement.querySelector('.nav-header');
    if (header) {
      header.classList.add('compact-header');
    }
    
    // Make filters more compact
    const filters = this.navElement.querySelector('.nav-filters');
    if (filters) {
      filters.classList.add('compact-filters');
    }
    
    // Reduce games list height
    const gamesList = this.navElement.querySelector('.games-list');
    if (gamesList) {
      gamesList.classList.add('compact-games');
    }
  }
  
  /**
   * Toggle navigation collapse state
   */
  toggleNavigationCollapse() {
    const navElement = this.navElement;
    const filters = navElement.querySelector('.nav-filters');
    const gamesList = navElement.querySelector('.games-list');
    const footer = navElement.querySelector('.nav-footer');
    const collapseBtn = navElement.querySelector('.nav-collapse-btn');
    
    if (navElement.classList.contains('collapsed')) {
      // Expand navigation
      navElement.classList.remove('collapsed');
      if (filters) filters.style.display = 'block';
      if (gamesList) gamesList.style.display = 'block';
      if (footer) footer.style.display = 'block';
      if (collapseBtn) collapseBtn.innerHTML = '<span class="collapse-icon">◀</span>';
    } else {
      // Collapse navigation
      navElement.classList.add('collapsed');
      if (filters) filters.style.display = 'none';
      if (gamesList) gamesList.style.display = 'none';
      if (footer) footer.style.display = 'none';
      if (collapseBtn) collapseBtn.innerHTML = '<span class="collapse-icon">▶</span>';
    }
  }
  
  /**
   * Initialize navigation as collapsed by default
   */
  initCollapsedState() {
    const navElement = this.navElement;
    const filters = navElement.querySelector('.nav-filters');
    const gamesList = navElement.querySelector('.games-list');
    const footer = navElement.querySelector('.nav-footer');
    const collapseBtn = navElement.querySelector('.nav-collapse-btn');
    
    // Start collapsed
    navElement.classList.add('collapsed');
    if (filters) filters.style.display = 'none';
    if (gamesList) gamesList.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (collapseBtn) collapseBtn.innerHTML = '<span class="collapse-icon">▶</span>';
    
    // Add clear instruction text
    const instruction = document.createElement('div');
    instruction.className = 'nav-instruction';
    instruction.innerHTML = '<span class="instruction-text">Click ▶ to expand games menu</span>';
    instruction.style.cssText = `
      color: var(--retro-green);
      font-size: var(--font-size-sm);
      text-align: center;
      padding: 10px;
      border-top: 1px solid var(--retro-green);
      margin-top: 10px;
    `;
    
    const header = navElement.querySelector('.nav-header');
    if (header) {
      header.appendChild(instruction);
    }
  }
  
  /**
   * Create mobile toggle button
   */
  createMobileToggle() {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-nav-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle games menu');
    toggleBtn.innerHTML = '<span class="toggle-icon">☰</span><span class="toggle-text">Games Menu</span>';
    
    toggleBtn.addEventListener('click', () => {
      this.toggleMobileMenu();
    });
    
    this.navElement.appendChild(toggleBtn);
  }
  
  /**
   * Create navigation header
   */
  createNavigationHeader(container) {
    const header = document.createElement('div');
    header.className = 'nav-header';
    
    const title = document.createElement('h2');
    title.textContent = '🎮 Games Collection';
    title.className = 'nav-title';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Choose your adventure';
    subtitle.className = 'nav-subtitle';
    
    // Add collapsible controls
    const controls = document.createElement('div');
    controls.className = 'nav-controls';
    
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'nav-collapse-btn';
    collapseBtn.setAttribute('aria-label', 'Collapse navigation');
    collapseBtn.innerHTML = '<span class="collapse-icon">◀</span>';
    collapseBtn.addEventListener('click', () => this.toggleNavigationCollapse());
    
    controls.appendChild(collapseBtn);
    header.appendChild(title);
    header.appendChild(subtitle);
    header.appendChild(controls);
    container.appendChild(header);
  }
  
  /**
   * Create search and filters
   */
  createSearchAndFilters(container) {
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'nav-filters';
    
    // Search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search games...';
    searchInput.className = 'search-input';
    searchInput.id = 'gameSearch';
    
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.filterGames();
    });
    
    searchContainer.appendChild(searchInput);
    filtersContainer.appendChild(searchContainer);
    
    // Category filter
    const categoryFilter = this.createFilter('Category', 'category', Object.keys(GAME_CATEGORIES), 'all');
    filtersContainer.appendChild(categoryFilter);
    
    // Difficulty filter
    const difficultyFilter = this.createFilter('Difficulty', 'difficulty', Object.keys(DIFFICULTY_LEVELS), 'all');
    filtersContainer.appendChild(difficultyFilter);
    
    container.appendChild(filtersContainer);
  }
  
  /**
   * Create filter dropdown
   */
  createFilter(label, name, options, defaultValue) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    
    const filterLabel = document.createElement('label');
    filterLabel.textContent = label;
    filterLabel.className = 'filter-label';
    
    const filterSelect = document.createElement('select');
    filterSelect.className = 'filter-select';
    filterSelect.id = `${name}Filter`;
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = `All ${label}s`;
    filterSelect.appendChild(defaultOption);
    
    // Add options
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = this.formatOptionName(option);
      filterSelect.appendChild(optionElement);
    });
    
    filterSelect.value = defaultValue;
    
    filterSelect.addEventListener('change', (e) => {
      this[`current${name.charAt(0).toUpperCase() + name.slice(1)}`] = e.target.value;
      this.filterGames();
    });
    
    filterContainer.appendChild(filterLabel);
    filterContainer.appendChild(filterSelect);
    
    return filterContainer;
  }
  
  /**
   * Format option names for display
   */
  formatOptionName(option) {
    return option
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Create games list
   */
  createGamesList(container) {
    const gamesContainer = document.createElement('div');
    gamesContainer.className = 'games-list';
    gamesContainer.id = 'gamesList';
    
    // Initial games list
    this.renderGamesList(gamesContainer);
    
    container.appendChild(gamesContainer);
  }
  
  /**
   * Render games list based on current filters
   */
  renderGamesList(container) {
    container.innerHTML = '';
    
    let games = GameConfigManager.getAllGames();
    
    // Apply category filter
    if (this.currentCategory !== 'all') {
      games = games.filter(game => game.category === this.currentCategory);
    }
    
    // Apply difficulty filter
    if (this.currentDifficulty !== 'all') {
      games = games.filter(game => game.difficulty === this.currentDifficulty);
    }
    
    // Apply search filter
    if (this.searchQuery) {
      games = games.filter(game => 
        game.title.toLowerCase().includes(this.searchQuery) ||
        game.description.toLowerCase().includes(this.searchQuery) ||
        game.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
      );
    }
    
    if (games.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.innerHTML = `
        <p>No games found matching your criteria.</p>
        <button class="btn btn-secondary" onclick="this.clearFilters()">Clear Filters</button>
      `;
      container.appendChild(noResults);
      return;
    }
    
    games.forEach(game => {
      const gameItem = this.createGameItem(game);
      container.appendChild(gameItem);
    });
  }
  
  /**
   * Create individual game item
   */
  createGameItem(game) {
    const gameItem = document.createElement('div');
    gameItem.className = 'game-item';
    gameItem.dataset.gameId = game.id;
    
    // Highlight current game
    if (game.id === this.currentGameId) {
      gameItem.classList.add('current-game');
    }
    
    const gameHeader = document.createElement('div');
    gameHeader.className = 'game-item-header';
    
    const gameTitle = document.createElement('h3');
    gameTitle.className = 'game-item-title';
    gameTitle.textContent = game.title;
    
    const gameCategory = document.createElement('span');
    gameCategory.className = 'game-item-category';
    gameCategory.textContent = GAME_CATEGORIES[game.category]?.icon || '🎮';
    
    gameHeader.appendChild(gameTitle);
    gameHeader.appendChild(gameCategory);
    
    const gameDescription = document.createElement('p');
    gameDescription.className = 'game-item-description';
    gameDescription.textContent = game.shortDescription;
    
    const gameMeta = document.createElement('div');
    gameMeta.className = 'game-item-meta';
    
    const difficulty = document.createElement('span');
    difficulty.className = 'game-item-difficulty';
    difficulty.textContent = '⭐'.repeat(DIFFICULTY_LEVELS[game.difficulty]?.stars || 1);
    
    const playTime = document.createElement('span');
    playTime.className = 'game-item-time';
    playTime.textContent = game.estimatedPlayTime;
    
    gameMeta.appendChild(difficulty);
    gameMeta.appendChild(playTime);
    
    const playButton = document.createElement('a');
    playButton.href = `../${game.id}/index.html`;
    playButton.className = 'game-item-play';
    playButton.textContent = 'Play Now';
    
    gameItem.appendChild(gameHeader);
    gameItem.appendChild(gameDescription);
    gameItem.appendChild(gameMeta);
    gameItem.appendChild(playButton);
    
    return gameItem;
  }
  
  /**
   * Create navigation footer
   */
  createNavigationFooter(container) {
    const footer = document.createElement('div');
    footer.className = 'nav-footer';
    
    const stats = document.createElement('div');
    stats.className = 'nav-stats';
    
    const totalGames = document.createElement('span');
    totalGames.textContent = `${Object.keys(GAME_CONFIGS).length} Games`;
    
    const randomButton = document.createElement('button');
    randomButton.className = 'btn btn-secondary btn-small';
    randomButton.textContent = '🎲 Random Game';
    randomButton.addEventListener('click', () => {
      this.goToRandomGame();
    });
    
    stats.appendChild(totalGames);
    stats.appendChild(randomButton);
    
    footer.appendChild(stats);
    container.appendChild(footer);
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
    
    // Window events
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  /**
   * Setup mobile navigation
   */
  setupMobileNavigation() {
    // Add mobile-specific styles
    this.addMobileStyles();
    
    // Handle touch events
    this.setupTouchHandling();
  }
  
  /**
   * Setup search and filters functionality
   */
  setupSearchAndFilters() {
    // Clear filters functionality
    window.clearFilters = () => {
      this.currentCategory = 'all';
      this.currentDifficulty = 'all';
      this.searchQuery = '';
      
      // Reset form elements
      document.getElementById('categoryFilter').value = 'all';
      document.getElementById('difficultyFilter').value = 'all';
      document.getElementById('gameSearch').value = '';
      
      this.filterGames();
    };
  }
  
  /**
   * Filter games based on current criteria
   */
  filterGames() {
    const gamesList = document.getElementById('gamesList');
    if (gamesList) {
      this.renderGamesList(gamesList);
    }
  }
  
  /**
   * Go to random game
   */
  goToRandomGame() {
    const games = GameConfigManager.getRandomGame();
    if (games) {
      window.location.href = `../${games.id}/index.html`;
    }
  }
  
  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    const toggleBtn = this.navElement.querySelector('.mobile-nav-toggle');
    const content = this.navElement.querySelector('.nav-content');
    
    if (this.isMobileMenuOpen) {
      content.classList.add('open');
      toggleBtn.querySelector('.toggle-icon').textContent = '✕';
      toggleBtn.querySelector('.toggle-text').textContent = 'Close';
    } else {
      content.classList.remove('open');
      toggleBtn.querySelector('.toggle-icon').textContent = '☰';
      toggleBtn.querySelector('.toggle-text').textContent = 'Games Menu';
    }
  }
  
  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    // Escape key to close mobile menu
    if (e.key === 'Escape' && this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('gameSearch');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Auto-close mobile menu on larger screens
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }
  
  /**
   * Setup touch handling
   */
  setupTouchHandling() {
    // Prevent text selection on touch devices
    this.navElement.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });
  }
  
  /**
   * Add mobile-specific styles
   */
  addMobileStyles() {
    if (!document.getElementById('mobile-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'mobile-nav-styles';
      style.textContent = `
        .enhanced-nav {
          background: var(--retro-bg);
          border: 2px solid var(--retro-green);
          border-radius: var(--game-border-radius);
          margin-bottom: var(--space-lg);
          overflow: hidden;
        }
        
        .mobile-nav-toggle {
          display: none;
          background: var(--retro-green);
          color: var(--retro-bg);
          border: none;
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--button-border-radius);
          font-size: var(--font-size-base);
          cursor: pointer;
          margin: var(--space-sm);
          font-family: monospace;
          transition: var(--transition-normal);
          width: 100%;
          justify-content: center;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .mobile-nav-toggle:hover,
        .mobile-nav-toggle:focus {
          background: var(--retro-yellow);
          color: var(--retro-bg);
        }
        
        .nav-content {
          padding: var(--space-md);
        }
        
        .nav-header {
          text-align: center;
          margin-bottom: var(--space-lg);
        }
        
        .nav-title {
          color: var(--retro-yellow);
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-sm);
          text-transform: uppercase;
        }
        
        .nav-subtitle {
          color: var(--retro-green);
          opacity: 0.8;
        }
        
        .nav-filters {
          display: grid;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        
        .search-container {
          grid-column: 1 / -1;
        }
        
        .search-input {
          width: 100%;
          padding: var(--space-sm);
          border: 2px solid var(--retro-green);
          background: var(--retro-bg);
          color: var(--retro-green);
          border-radius: var(--button-border-radius);
          font-family: inherit;
          font-size: var(--font-size-base);
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--retro-focus);
          box-shadow: var(--shadow-glow) var(--retro-focus);
        }
        
        .filter-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .filter-label {
          color: var(--retro-yellow);
          font-weight: bold;
          font-size: var(--font-size-sm);
          text-transform: uppercase;
        }
        
        .filter-select {
          padding: var(--space-sm);
          border: 2px solid var(--retro-green);
          background: var(--retro-bg);
          color: var(--retro-green);
          border-radius: var(--button-border-radius);
          font-family: inherit;
          font-size: var(--font-size-base);
        }
        
        .games-list {
          display: grid;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        
        .game-item {
          border: 2px solid var(--retro-green);
          border-radius: var(--game-border-radius);
          padding: var(--space-md);
          background: rgba(0, 255, 0, 0.05);
          transition: var(--transition-normal);
        }
        
        .game-item:hover {
          border-color: var(--retro-yellow);
          box-shadow: var(--shadow-glow) var(--retro-yellow);
          transform: translateY(-2px);
        }
        
        .game-item.current-game {
          border-color: var(--retro-yellow);
          background: rgba(255, 215, 0, 0.1);
        }
        
        .game-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
        }
        
        .game-item-title {
          color: var(--retro-yellow);
          font-size: var(--font-size-lg);
          margin: 0;
        }
        
        .game-item-category {
          font-size: var(--font-size-xl);
        }
        
        .game-item-description {
          color: var(--retro-green);
          margin-bottom: var(--space-sm);
          font-size: var(--font-size-sm);
        }
        
        .game-item-meta {
          display: flex;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
          font-size: var(--font-size-sm);
        }
        
        .game-item-difficulty,
        .game-item-time {
          color: var(--retro-cyan);
        }
        
        .game-item-play {
          display: inline-block;
          background: var(--retro-green);
          color: var(--retro-bg);
          padding: var(--space-sm) var(--space-md);
          text-decoration: none;
          border-radius: var(--button-border-radius);
          font-weight: bold;
          text-transform: uppercase;
          text-align: center;
          transition: var(--transition-normal);
        }
        
        .game-item-play:hover {
          background: var(--retro-yellow);
          color: var(--retro-bg);
          box-shadow: var(--shadow-glow) var(--retro-yellow);
        }
        
        .nav-footer {
          text-align: center;
          padding-top: var(--space-md);
          border-top: 1px solid var(--retro-green);
        }
        
        .nav-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--retro-green);
          font-size: var(--font-size-sm);
        }
        
        .no-results {
          text-align: center;
          color: var(--retro-green);
          padding: var(--space-xl);
        }
        
        @media (max-width: 767px) {
          .mobile-nav-toggle {
            display: flex;
          }
          
          .nav-content {
            display: none;
          }
          
          .nav-content.open {
            display: block;
          }
          
          .nav-filters {
            grid-template-columns: 1fr;
          }
          
          .games-list {
            grid-template-columns: 1fr;
          }
          
          .nav-stats {
            flex-direction: column;
            gap: var(--space-sm);
          }
        }
        
        @media (min-width: 768px) {
          .nav-filters {
            grid-template-columns: 1fr 1fr;
          }
          
          .games-list {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Get navigation element
   */
  getNavElement() {
    return this.navElement;
  }
  
  /**
   * Update current game
   */
  updateCurrentGame(gameId) {
    this.currentGameId = gameId;
    
    // Update current game highlighting
    const gameItems = document.querySelectorAll('.game-item');
    gameItems.forEach(item => {
      item.classList.remove('current-game');
      if (item.dataset.gameId === gameId) {
        item.classList.add('current-game');
      }
    });
  }
  
  /**
   * Destroy navigation
   */
  destroy() {
    if (this.navElement && this.navElement.parentElement) {
      this.navElement.parentElement.removeChild(this.navElement);
    }
    
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.enhancedNavigation = new EnhancedNavigation();
});

export default EnhancedNavigation;
