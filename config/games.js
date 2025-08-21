/**
 * Game Configuration System
 * Centralized configuration for all games in the Retro Games Collection
 */

export const GAME_CONFIGS = {
  chompy: {
    id: 'chompy',
    title: 'Chompy',
    description: 'Navigate through mazes, eat dots, and avoid ghosts in this classic arcade game.',
    shortDescription: 'Classic maze game with ghosts',
    category: 'arcade',
    difficulty: 'medium',
    maxWidth: 1200,
    aspectRatio: '560/640',
    canvasWidth: 560,
    canvasHeight: 640,
    modules: ['audio', 'fireworks', 'rocket'],
    controls: ['arrow-keys', 'touch'],
    features: ['multiple-maps', 'score-tracking', 'lives-system'],
    estimatedPlayTime: '5-15 minutes',
    tags: ['maze', 'ghosts', 'dots', 'classic'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  },
  
  'block-stack': {
    id: 'block-stack',
    title: 'Block Stack',
    description: 'Stack falling blocks to create complete lines in this addictive puzzle game.',
    shortDescription: 'Tetris-style block stacking',
    category: 'puzzle',
    difficulty: 'easy',
    maxWidth: 800,
    aspectRatio: '240/480',
    canvasWidth: 240,
    canvasHeight: 480,
    modules: ['audio'],
    controls: ['arrow-keys', 'touch'],
    features: ['line-clearing', 'score-tracking', 'level-progression'],
    estimatedPlayTime: '3-10 minutes',
    tags: ['tetris', 'blocks', 'puzzle', 'stacking'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  },
  
  wormy: {
    id: 'wormy',
    title: 'Wormy',
    description: 'Control a growing worm, eat food, and avoid hitting walls or yourself.',
    shortDescription: 'Snake game with growing worm',
    category: 'arcade',
    difficulty: 'easy',
    maxWidth: 600,
    aspectRatio: '400/400',
    canvasWidth: 400,
    canvasHeight: 400,
    modules: ['audio'],
    controls: ['arrow-keys', 'touch'],
    features: ['score-tracking', 'speed-increase', 'food-spawning'],
    estimatedPlayTime: '2-8 minutes',
    tags: ['snake', 'worm', 'food', 'simple'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  },
  
  'bubble-pop': {
    id: 'bubble-pop',
    title: 'Bubble Pop',
    description: 'Pop colorful bubbles with realistic physics and satisfying sound effects!',
    shortDescription: 'Physics-based bubble popping',
    category: 'casual',
    difficulty: 'easy',
    maxWidth: 960,
    aspectRatio: '960/480',
    canvasWidth: 960,
    canvasHeight: 480,
    modules: ['audio'],
    controls: ['mouse', 'touch'],
    features: ['physics-simulation', 'particle-effects', 'score-tracking'],
    estimatedPlayTime: '3-12 minutes',
    tags: ['bubbles', 'physics', 'casual', 'relaxing'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  },
  
  'road-dash': {
    id: 'road-dash',
    title: 'Road Dash',
    description: 'Help the frog cross the road and river safely.',
    shortDescription: 'Frogger-style crossing game',
    category: 'arcade',
    difficulty: 'medium',
    maxWidth: 600,
    aspectRatio: '400/600',
    canvasWidth: 400,
    canvasHeight: 600,
    modules: ['audio'],
    controls: ['arrow-keys', 'touch'],
    features: ['obstacle-avoidance', 'score-tracking', 'multiple-lanes'],
    estimatedPlayTime: '2-6 minutes',
    tags: ['frogger', 'crossing', 'obstacles', 'timing'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  },
  
  'paddle-ball': {
    id: 'paddle-ball',
    title: 'Paddle Ball',
    description: 'The classic two-player table tennis simulation game.',
    shortDescription: 'Two-player pong game',
    category: 'sports',
    difficulty: 'medium',
    maxWidth: 800,
    aspectRatio: '800/400',
    canvasWidth: 800,
    canvasHeight: 400,
    modules: ['audio'],
    controls: ['wasd-arrows', 'touch'],
    features: ['two-player', 'score-tracking', 'paddle-controls'],
    estimatedPlayTime: '3-8 minutes',
    tags: ['pong', 'tennis', 'two-player', 'competitive'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  },
  
  'number-defenders': {
    id: 'number-defenders',
    title: 'Number Defenders',
    description: 'Solve math problems while defending against invading aliens.',
    shortDescription: 'Math + tower defense',
    category: 'educational',
    difficulty: 'hard',
    maxWidth: 1200,
    aspectRatio: '800/600',
    canvasWidth: 800,
    canvasHeight: 600,
    modules: ['audio', 'fireworks', 'rocket'],
    controls: ['mouse', 'touch'],
    features: ['math-problems', 'tower-defense', 'rocket-progression'],
    estimatedPlayTime: '10-25 minutes',
    tags: ['math', 'defense', 'educational', 'strategy'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  },
  
  'word-defenders': {
    id: 'word-defenders',
    title: 'Word Defenders',
    description: 'Improve your spelling while defending against word-based invaders.',
    shortDescription: 'Spelling + tower defense',
    category: 'educational',
    difficulty: 'hard',
    maxWidth: 1200,
    aspectRatio: '800/600',
    canvasWidth: 800,
    canvasHeight: 600,
    modules: ['audio', 'fireworks', 'rocket'],
    controls: ['keyboard', 'touch'],
    features: ['spelling-challenges', 'tower-defense', 'rocket-progression'],
    estimatedPlayTime: '10-25 minutes',
    tags: ['spelling', 'defense', 'educational', 'strategy'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  },
  
  'pipe-dream': {
    id: 'pipe-dream',
    title: 'Pipe Dream',
    description: 'Connect pipes to solve math problems and watch the water flow in this puzzle game!',
    shortDescription: 'Pipe connection puzzle game',
    category: 'puzzle',
    difficulty: 'hard',
    maxWidth: 1200,
    aspectRatio: '800/600',
    canvasWidth: 800,
    canvasHeight: 600,
    modules: ['audio'],
    controls: ['mouse', 'touch'],
    features: ['pipe-connection', 'math-integration', 'water-flow'],
    estimatedPlayTime: '15-30 minutes',
    tags: ['pipes', 'puzzle', 'math', 'flow'],
    version: '1.0.0',
    lastUpdated: '2025-01-01'
  }
};

/**
 * Game Categories
 */
export const GAME_CATEGORIES = {
  arcade: {
    name: 'Arcade',
    description: 'Classic arcade-style games',
    icon: '🎮',
    color: 'var(--retro-green)'
  },
  puzzle: {
    name: 'Puzzle',
    description: 'Brain-teasing puzzle games',
    icon: '🧩',
    color: 'var(--retro-yellow)'
  },
  casual: {
    name: 'Casual',
    description: 'Easy-to-pick-up casual games',
    icon: '😌',
    color: 'var(--retro-cyan)'
  },
  sports: {
    name: 'Sports',
    description: 'Sports and competitive games',
    icon: '⚽',
    color: 'var(--retro-red)'
  },
  educational: {
    name: 'Educational',
    description: 'Learn while you play',
    icon: '📚',
    color: 'var(--retro-magenta)'
  }
};

/**
 * Difficulty Levels
 */
export const DIFFICULTY_LEVELS = {
  easy: {
    name: 'Easy',
    description: 'Suitable for beginners',
    color: 'var(--retro-green)',
    stars: 1
  },
  medium: {
    name: 'Medium',
    description: 'Moderate challenge',
    color: 'var(--retro-yellow)',
    stars: 2
  },
  hard: {
    name: 'Hard',
    description: 'Challenging gameplay',
    color: 'var(--retro-red)',
    stars: 3
  }
};

/**
 * Module Definitions
 */
export const GAME_MODULES = {
  audio: {
    name: 'Audio',
    description: 'Sound effects and music',
    file: 'core/audio.js',
    required: false
  },
  fireworks: {
    name: 'Fireworks',
    description: 'Celebration effects',
    file: 'core/fireworks.js',
    required: false
  },
  rocket: {
    name: 'Rocket',
    description: 'Progression visualization',
    file: 'core/rocket.js',
    required: false
  }
};

/**
 * Control Schemes
 */
export const CONTROL_SCHEMES = {
  'arrow-keys': {
    name: 'Arrow Keys',
    description: 'Use arrow keys to move',
    icon: '⬆️⬇️⬅️➡️'
  },
  'wasd-arrows': {
    name: 'WASD + Arrows',
    description: 'WASD for player 1, arrows for player 2',
    icon: 'WASD + ⬆️⬇️⬅️➡️'
  },
  mouse: {
    name: 'Mouse',
    description: 'Click and drag to interact',
    icon: '🖱️'
  },
  keyboard: {
    name: 'Keyboard',
    description: 'Type to play',
    icon: '⌨️'
  },
  touch: {
    name: 'Touch',
    description: 'Touch-friendly controls',
    icon: '👆'
  }
};

/**
 * Utility Functions
 */
export class GameConfigManager {
  /**
   * Get all games
   */
  static getAllGames() {
    return Object.values(GAME_CONFIGS);
  }
  
  /**
   * Get games by category
   */
  static getGamesByCategory(category) {
    return this.getAllGames().filter(game => game.category === category);
  }
  
  /**
   * Get games by difficulty
   */
  static getGamesByDifficulty(difficulty) {
    return this.getAllGames().filter(game => game.difficulty === difficulty);
  }
  
  /**
   * Get games that use specific modules
   */
  static getGamesByModule(moduleName) {
    return this.getAllGames().filter(game => game.modules.includes(moduleName));
  }
  
  /**
   * Get game by ID
   */
  static getGameById(id) {
    return GAME_CONFIGS[id] || null;
  }
  
  /**
   * Get random game
   */
  static getRandomGame() {
    const games = this.getAllGames();
    return games[Math.floor(Math.random() * games.length)];
  }
  
  /**
   * Get games sorted by difficulty
   */
  static getGamesSortedByDifficulty() {
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
    return this.getAllGames().sort((a, b) => 
      difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    );
  }
  
  /**
   * Get games sorted by estimated play time
   */
  static getGamesSortedByPlayTime() {
    return this.getAllGames().sort((a, b) => {
      const timeA = parseInt(a.estimatedPlayTime.split('-')[0]);
      const timeB = parseInt(b.estimatedPlayTime.split('-')[0]);
      return timeA - timeB;
    });
  }
  
  /**
   * Search games by tags or description
   */
  static searchGames(query) {
    const searchTerm = query.toLowerCase();
    return this.getAllGames().filter(game => 
      game.title.toLowerCase().includes(searchTerm) ||
      game.description.toLowerCase().includes(searchTerm) ||
      game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  /**
   * Get games that support touch controls
   */
  static getTouchCompatibleGames() {
    return this.getAllGames().filter(game => 
      game.controls.includes('touch')
    );
  }
  
  /**
   * Get games that support keyboard controls
   */
  static getKeyboardCompatibleGames() {
    return this.getAllGames().filter(game => 
      game.controls.some(control => 
        control.includes('keys') || control === 'keyboard'
      )
    );
  }
}

export default GAME_CONFIGS;
