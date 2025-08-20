# 🎮 Retro Games Collection

A collection of classic retro games playable in your web browser. All games are built with HTML5 Canvas and JavaScript.

## 🎯 Games Included

- **Pac-Man** - Classic maze game with ghosts and power pellets
- **Tetris** - Block-stacking puzzle game
- **Snake** - Control a growing snake to eat food
- **Breakout** - Break bricks with a bouncing ball
- **Frogger** - Help the frog cross the road safely
- **Pong** - Classic two-player table tennis
- **Maths Invaders** - Solve math problems while fighting aliens
- **Spelling Invaders** - Improve spelling while defending against word invaders

## 🚀 How to Deploy

### Option 1: Simple Web Server
1. Upload all files to your web server
2. Ensure the server supports HTML files
3. Access via `yourdomain.com/index.html`

### Option 2: GitHub Pages
1. Create a new repository
2. Upload all files
3. Enable GitHub Pages in repository settings
4. Access via `username.github.io/repository-name`

### Option 3: Netlify
1. Drag and drop the folder to [Netlify](https://netlify.com)
2. Get instant deployment
3. Custom domain available

### Option 4: Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Automatic deployments on push
3. Global CDN included

## 📁 File Structure

```
/
├── index.html              # Main homepage
├── styles.css              # Shared styling
├── navigation.js           # Shared navigation
├── pac-man.html           # Pac-Man game
├── tetris.html            # Tetris game
├── snake.html             # Snake game
├── breakout.html          # Breakout game
├── frogger.html           # Frogger game
├── pong.html              # Pong game
├── maths-invaders.html    # Maths Invaders game
├── spelling-invaders.html # Spelling Invaders game
└── README.md              # This file
```

## 🎮 Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Unified Navigation** - Easy switching between games
- **Home Button** - Quick return to main menu from any game
- **Keyboard Shortcuts** - Press `Escape` or `H` to go home
- **Retro Aesthetic** - Classic green-on-black terminal look
- **No Dependencies** - Pure HTML, CSS, and JavaScript

## 🎯 Controls

Each game has its own control scheme, but common shortcuts include:
- **P** - Pause/Resume
- **R** - Reset/Restart
- **Arrow Keys** - Movement
- **Escape** or **H** - Return to main menu

## 🔧 Customization

### Adding New Games
1. Create a new HTML file with your game
2. Add a `<nav id="gameNav">` element
3. Include `<script src="navigation.js"></script>`
4. Add the game to the `gameFiles` array in `navigation.js`

### Styling
- Modify `styles.css` for global changes
- Each game can have its own CSS for specific styling
- The retro green theme can be customized in the CSS variables

## 🌐 Browser Compatibility

- **Modern Browsers** - Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers** - iOS Safari, Chrome Mobile, Samsung Internet
- **Requires** - HTML5 Canvas support, JavaScript enabled

## 📱 Mobile Experience

- Touch-friendly controls
- Responsive layout
- Optimized for mobile screens
- Works offline (after initial load)

## 🚀 Performance Tips

- Games are lightweight and load quickly
- Canvas rendering is hardware-accelerated
- Minimal external dependencies
- Optimized for smooth gameplay

## 🎨 Design Philosophy

The website maintains a consistent retro aesthetic:
- Green terminal text (#0f0)
- Black background (#000)
- Gold accents (#ffd700)
- Monospace fonts for authenticity
- Pixel-perfect game graphics

## 🔒 Security

- No external scripts or tracking
- Client-side only games
- No data collection
- Safe for all ages

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Ensure JavaScript is enabled
3. Try refreshing the page
4. Check file permissions on your server

## 📄 License

This is a collection of retro games for educational and entertainment purposes. Individual games may have their own licensing terms.

---

**Enjoy your retro gaming experience!** 🎮✨
