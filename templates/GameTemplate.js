/**
 * Game Template Engine
 * Generates standardized HTML for all games in the Retro Games Collection
 */

export class GameTemplate {
  constructor(gameConfig) {
    this.config = gameConfig;
    this.templateData = this.prepareTemplateData();
  }
  
  /**
   * Prepare template data with defaults and validation
   */
  prepareTemplateData() {
    return {
      id: this.config.id,
      title: this.config.title,
      description: this.config.description,
      shortDescription: this.config.shortDescription,
      category: this.config.category,
      difficulty: this.config.difficulty,
      maxWidth: this.config.maxWidth || 1200,
      aspectRatio: this.config.aspectRatio,
      canvasWidth: this.config.canvasWidth,
      canvasHeight: this.config.canvasHeight,
      modules: this.config.modules || [],
      controls: this.config.controls || [],
      features: this.config.features || [],
      estimatedPlayTime: this.config.estimatedPlayTime || '5-15 minutes',
      tags: this.config.tags || [],
      version: this.config.version || '1.0.0',
      lastUpdated: this.config.lastUpdated || new Date().toISOString().split('T')[0]
    };
  }
  
  /**
   * Generate the complete HTML document
   */
  generateHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${this.templateData.description}">
    <meta name="keywords" content="${this.templateData.tags.join(', ')}">
    <meta name="author" content="Retro Games Collection">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="game">
    <meta property="og:url" content="https://retrogames.com/${this.templateData.id}">
    <meta property="og:title" content="${this.templateData.title} - Retro Games Collection">
    <meta property="og:description" content="${this.templateData.description}">
    <meta property="og:image" content="https://retrogames.com/images/${this.templateData.id}.jpg">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://retrogames.com/${this.templateData.id}">
    <meta property="twitter:title" content="${this.templateData.title} - Retro Games Collection">
    <meta property="twitter:description" content="${this.templateData.description}">
    <meta property="twitter:image" content="https://retrogames.com/images/${this.templateData.id}.jpg">
    
    <title>${this.templateData.title} - Retro Games Collection</title>
    
    <!-- Core CSS -->
    <link rel="stylesheet" href="../core/base.css">
    <link rel="stylesheet" href="../core/components.css">
    <link rel="stylesheet" href="../core/responsive.css">
    
    <!-- Game-specific CSS -->
    <link rel="stylesheet" href="../games/${this.templateData.id}/styles.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="../core/gameLoader.js" as="script">
    <link rel="preload" href="../games/${this.templateData.id}/game.js" as="script">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": "${this.templateData.title}",
      "description": "${this.templateData.description}",
      "genre": "${this.templateData.category}",
      "gamePlatform": "Web Browser",
      "applicationCategory": "Game",
      "operatingSystem": "Any",
      "url": "https://retrogames.com/${this.templateData.id}",
      "author": {
        "@type": "Organization",
        "name": "Retro Games Collection"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
    </script>
</head>
<body>
    <!-- Skip to main content link for accessibility -->
    <a href="#gameContent" class="sr-only sr-only-focusable">Skip to main content</a>
    
    <!-- Game Container -->
    <div class="game-container" data-game="${this.templateData.id}" id="gameContainer">
        ${this.generateGameContent()}
    </div>
    
    <!-- Home Button -->
    <a href="../index.html" class="home-button" aria-label="Back to games collection">
        🏠 Back to Games
    </a>
    
    <!-- Loading Indicator -->
    <div id="loadingIndicator" class="loading-overlay">
        <div class="loading-spinner">
            <div class="loading"></div>
            <p>Loading ${this.templateData.title}...</p>
        </div>
    </div>
    
    <!-- Error Boundary -->
    <div id="errorBoundary" class="error-overlay" style="display: none;">
        <div class="error-content">
            <h2>Oops! Something went wrong</h2>
            <p>There was an error loading ${this.templateData.title}.</p>
            <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
            <a href="../index.html" class="btn btn-secondary">Back to Games</a>
        </div>
    </div>
    
    <!-- Core Scripts -->
    <script type="module" src="../core/gameLoader.js"></script>
    <script type="module" src="../games/${this.templateData.id}/game.js"></script>
    
    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('../sw.js')
                    .then(registration => console.log('SW registered'))
                    .catch(error => console.log('SW registration failed'));
            });
        }
    </script>
    
    <!-- Analytics (if needed) -->
    <script>
        // Game analytics tracking
        window.gameAnalytics = {
            gameId: '${this.templateData.id}',
            gameTitle: '${this.templateData.title}',
            category: '${this.templateData.category}',
            difficulty: '${this.templateData.difficulty}',
            startTime: Date.now()
        };
        
        // Track game start
        window.addEventListener('load', () => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'game_start', {
                    game_id: '${this.templateData.id}',
                    game_title: '${this.templateData.title}'
                });
            }
        });
    </script>
</body>
</html>`;
  }
  
  /**
   * Generate the main game content area
   */
  generateGameContent() {
    return `
        <!-- Game Header -->
        <header class="game-header">
            <h1 class="game-title" id="gameTitle">${this.templateData.title}</h1>
            <div class="game-meta">
                <span class="game-category">${this.getCategoryIcon()} ${this.templateData.category}</span>
                <span class="game-difficulty">${this.getDifficultyStars()} ${this.templateData.difficulty}</span>
                <span class="game-time">⏱️ ${this.templateData.estimatedPlayTime}</span>
            </div>
        </header>
        
        <!-- Main Game Content -->
        <main class="game-content" id="gameContent">
            <!-- Game Canvas Area -->
            <div class="game-canvas-area">
                <canvas 
                    id="gameCanvas" 
                    class="game-canvas"
                    width="${this.templateData.canvasWidth}"
                    height="${this.templateData.canvasHeight}"
                    style="aspect-ratio: ${this.templateData.aspectRatio};"
                    tabindex="0"
                    role="application"
                    aria-label="${this.templateData.title} game canvas"
                    aria-describedby="gameInstructions">
                </canvas>
                
                <!-- Game Overlay Elements -->
                <div id="gameOverlay" class="game-overlay" style="display: none;">
                    <div class="overlay-content">
                        <h2 id="overlayTitle">Game Over</h2>
                        <p id="overlayMessage">Your final score: <span id="finalScore">0</span></p>
                        <div class="overlay-buttons">
                            <button id="restartButton" class="btn btn-primary">Play Again</button>
                            <button id="menuButton" class="btn btn-secondary">Main Menu</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Game Sidebar -->
            <aside class="game-sidebar">
                ${this.generateSidebar()}
            </aside>
        </main>
        
        <!-- Touch Controls (Mobile) -->
        <div id="touchControls" class="touch-controls">
            ${this.generateTouchControls()}
        </div>
        
        <!-- Game Instructions -->
        <section class="game-instructions" id="gameInstructions">
            <h2>How to Play</h2>
            <p>${this.templateData.description}</p>
            ${this.generateFeatureList()}
        </section>
        
        <!-- Game Footer -->
        <footer class="game-footer">
            <div class="game-info">
                <span>Version ${this.templateData.version}</span>
                <span>Last updated: ${this.templateData.lastUpdated}</span>
            </div>
            <div class="game-tags">
                ${this.templateData.tags.map(tag => `<span class="game-tag">${tag}</span>`).join('')}
            </div>
        </footer>`;
  }
  
  /**
   * Generate the sidebar content
   */
  generateSidebar() {
    return `
                <!-- Scoreboard -->
                <div class="sidebar-section scoreboard">
                    <h3 class="section-title">Score</h3>
                    <div class="score-grid">
                        <div class="score-item">
                            <span class="score-label">Score:</span>
                            <span class="score-value" id="scoreValue">0</span>
                        </div>
                        <div class="score-item">
                            <span class="score-label">Lives:</span>
                            <span class="score-value" id="livesValue">3</span>
                        </div>
                        <div class="score-item">
                            <span class="score-label">Level:</span>
                            <span class="score-value" id="levelValue">1</span>
                        </div>
                    </div>
                </div>
                
                <!-- Controls -->
                <div class="sidebar-section">
                    <h3 class="section-title">Controls</h3>
                    <div class="controls-list">
                        ${this.generateControlsList()}
                    </div>
                </div>
                
                <!-- Game Stats -->
                <div class="sidebar-section">
                    <h3 class="section-title">Stats</h3>
                    <div class="stats-list">
                        <div class="stat-item">
                            <span class="stat-label">Category:</span>
                            <span class="stat-value">${this.templateData.category}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Difficulty:</span>
                            <span class="stat-value">${this.templateData.difficulty}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Play Time:</span>
                            <span class="stat-value">${this.templateData.estimatedPlayTime}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="sidebar-section">
                    <h3 class="section-title">Quick Actions</h3>
                    <div class="action-buttons">
                        <button id="pauseButton" class="btn btn-secondary btn-small">⏸️ Pause</button>
                        <button id="muteButton" class="btn btn-secondary btn-small">🔊 Mute</button>
                        <button id="fullscreenButton" class="btn btn-secondary btn-small">⛶ Fullscreen</button>
                    </div>
                </div>`;
  }
  
  /**
   * Generate touch controls for mobile
   */
  generateTouchControls() {
    if (!this.templateData.controls.includes('touch')) {
      return '';
    }
    
    let controls = '';
    
    if (this.templateData.controls.includes('arrow-keys')) {
      controls += `
                        <button class="touch-button" data-key="ArrowUp" aria-label="Up">⬆️</button>
                        <div class="touch-row">
                            <button class="touch-button" data-key="ArrowLeft" aria-label="Left">⬅️</button>
                            <button class="touch-button" data-key="ArrowRight" aria-label="Right">➡️</button>
                        </div>
                        <button class="touch-button" data-key="ArrowDown" aria-label="Down">⬇️</button>`;
    }
    
    if (this.templateData.controls.includes('mouse')) {
      controls += `<button class="touch-button touch-action" data-action="click" aria-label="Action">🎯</button>`;
    }
    
    return controls;
  }
  
  /**
   * Generate controls list
   */
  generateControlsList() {
    const controlInfo = {
      'arrow-keys': { name: 'Arrow Keys', description: 'Use arrow keys to move' },
      'wasd-arrows': { name: 'WASD + Arrows', description: 'WASD for player 1, arrows for player 2' },
      'mouse': { name: 'Mouse', description: 'Click and drag to interact' },
      'keyboard': { name: 'Keyboard', description: 'Type to play' },
      'touch': { name: 'Touch', description: 'Touch-friendly controls' }
    };
    
    return this.templateData.controls.map(control => {
      const info = controlInfo[control] || { name: control, description: 'Game controls' };
      return `<div class="control-item">
                        <span class="control-name">${info.name}</span>
                        <span class="control-description">${info.description}</span>
                    </div>`;
    }).join('');
  }
  
  /**
   * Generate feature list
   */
  generateFeatureList() {
    if (!this.templateData.features.length) return '';
    
    return `<h3>Features:</h3>
            <ul class="feature-list">
                ${this.templateData.features.map(feature => 
                  `<li>${this.formatFeatureName(feature)}</li>`
                ).join('')}
            </ul>`;
  }
  
  /**
   * Get category icon
   */
  getCategoryIcon() {
    const icons = {
      arcade: '🎮',
      puzzle: '🧩',
      casual: '😌',
      sports: '⚽',
      educational: '📚'
    };
    return icons[this.templateData.category] || '🎯';
  }
  
  /**
   * Get difficulty stars
   */
  getDifficultyStars() {
    const stars = {
      easy: '⭐',
      medium: '⭐⭐',
      hard: '⭐⭐⭐'
    };
    return stars[this.templateData.difficulty] || '⭐';
  }
  
  /**
   * Format feature name for display
   */
  formatFeatureName(feature) {
    return feature
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Generate CSS for the game
   */
  generateCSS() {
    return `/* ========================================
   ${this.templateData.title.toUpperCase()} - GAME SPECIFIC STYLES
   ======================================== */

/* Game-specific overrides and customizations */
.game-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.game-meta {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--space-sm);
}

.game-category,
.game-difficulty,
.game-time {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid var(--retro-green);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--button-border-radius);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
}

.game-canvas-area {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-content {
  text-align: center;
  color: var(--retro-green);
  padding: var(--space-xl);
}

.overlay-buttons {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  margin-top: var(--space-lg);
}

.score-grid {
  display: grid;
  gap: var(--space-sm);
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-label {
  color: var(--retro-green);
}

.score-value {
  color: var(--retro-yellow);
  font-weight: bold;
}

.controls-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.control-name {
  color: var(--retro-yellow);
  font-weight: bold;
  text-transform: uppercase;
}

.control-description {
  color: var(--retro-green);
  font-size: var(--font-size-sm);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: var(--retro-green);
}

.stat-value {
  color: var(--retro-yellow);
  font-weight: bold;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.game-instructions {
  margin-top: var(--space-xl);
  padding: var(--space-lg);
  border: 2px solid var(--retro-green);
  border-radius: var(--game-border-radius);
  background: rgba(0, 0, 0, 0.3);
}

.game-instructions h2 {
  color: var(--retro-yellow);
  margin-bottom: var(--space-md);
  text-align: center;
  text-transform: uppercase;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: var(--space-md) 0 0 0;
}

.feature-list li {
  padding: var(--space-xs) 0;
  color: var(--retro-green);
  position: relative;
  padding-left: var(--space-lg);
}

.feature-list li::before {
  content: '▶';
  color: var(--retro-yellow);
  position: absolute;
  left: 0;
}

.game-footer {
  margin-top: var(--space-xl);
  padding: var(--space-lg);
  border-top: 2px solid var(--retro-green);
  text-align: center;
}

.game-info {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
  color: var(--retro-green);
  opacity: 0.7;
}

.game-tags {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.game-tag {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid var(--retro-green);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--button-border-radius);
  font-size: var(--font-size-sm);
  color: var(--retro-green);
}

.home-button {
  position: fixed;
  top: var(--space-md);
  right: var(--space-md);
  background: var(--retro-bg);
  color: var(--retro-green);
  padding: var(--space-sm) var(--space-md);
  text-decoration: none;
  border: 2px solid var(--retro-green);
  border-radius: var(--button-border-radius);
  font-weight: bold;
  z-index: 1000;
  transition: var(--transition-normal);
}

.home-button:hover,
.home-button:focus {
  background: var(--retro-green);
  color: var(--retro-bg);
  box-shadow: var(--shadow-glow) var(--retro-green);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--retro-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-spinner {
  text-align: center;
  color: var(--retro-green);
}

.loading-spinner p {
  margin-top: var(--space-md);
  font-size: var(--font-size-lg);
}

.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--retro-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.error-content {
  text-align: center;
  color: var(--retro-red);
  padding: var(--space-xl);
  max-width: 500px;
}

.error-content h2 {
  color: var(--retro-red);
  margin-bottom: var(--space-md);
}

.error-content .btn {
  margin: var(--space-sm);
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .game-meta {
    flex-direction: column;
    align-items: center;
  }
  
  .overlay-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .game-info {
    flex-direction: column;
    gap: var(--space-sm);
  }
}`;
  }
  
  /**
   * Generate the complete game package
   */
  generateGamePackage() {
    return {
      html: this.generateHTML(),
      css: this.generateCSS(),
      config: this.templateData
    };
  }
  
  /**
   * Save the generated files
   */
  async saveGamePackage(outputDir) {
    // This would typically save files to the filesystem
    // For now, we'll return the package data
    return this.generateGamePackage();
  }
}

export default GameTemplate;
