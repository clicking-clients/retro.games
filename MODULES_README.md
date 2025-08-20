# Game Modules - Rocket, Fireworks & Audio

This directory contains modular components that can be shared between different games to provide consistent rocket animations, fireworks effects, and audio feedback.

## Modules

### 1. `audio.js` - GameAudio Class
Provides all audio functionality for games:
- **beep(freq, dur, type, vol)** - Basic beep sound
- **rocketRumble()** - Rocket launch rumble sound
- **fireworksPop()** - Fireworks explosion sound
- **resume()** - Resume audio context (for autoplay restrictions)

### 2. `fireworks.js` - Fireworks Class
Handles fireworks animations and effects:
- **show(baseX, baseY, onComplete)** - Display fireworks at specified position
- **randColor()** - Generate random colors for fireworks
- **clear()** - Clear the fireworks canvas

### 3. `rocket.js` - Rocket Class
Manages rocket animations and behavior:
- **grow()** - Increase rocket height (called when completing objectives)
- **launch()** - Launch the rocket with realistic physics
- **resetForLevel()** - Reset rocket for new level
- **destroy()** - Clean up animation frames

## Usage

### Basic Setup
```javascript
import { GameAudio } from './audio.js';
import { Fireworks } from './fireworks.js';
import { Rocket } from './rocket.js';

// Create instances
const audio = new GameAudio();
const fireworks = new Fireworks(canvas, audio);
const rocket = new Rocket(canvas, audio, fireworks, onLevelComplete);
```

### In Your Game
```javascript
// When player completes an objective
rocket.grow();

// When level is complete
rocket.launch();

// Reset for new level
rocket.resetForLevel();
```

### HTML Requirements
- Add `type="module"` to your script tag
- Ensure your server supports ES6 modules
- Canvas element for rocket overlay (recommended: 1200x720)

## Integration Examples

### Word Defenders
- Rocket grows with each completed word
- Launches when all words are completed
- Shows fireworks celebration

### Number Defenders  
- Rocket grows with each solved math problem
- Launches when all problems are solved
- Same visual and audio experience as Word Defenders

## Benefits

1. **Consistency** - Both games now have identical rocket experiences
2. **Maintainability** - Single source of truth for rocket logic
3. **Reusability** - Easy to add to new games
4. **Performance** - Optimized animations and audio
5. **Modularity** - Each component can be used independently

## Testing

Use `test-modules.html` to test all module functionality:
- Test audio effects
- Test fireworks display
- Test rocket creation, growth, and launch
- Verify all animations work correctly

## Browser Compatibility

- Requires ES6 module support
- Modern browsers (Chrome 61+, Firefox 60+, Safari 10.1+)
- Audio requires user interaction due to autoplay policies
