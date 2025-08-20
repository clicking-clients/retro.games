// Shared Navigation for Retro Games Collection
document.addEventListener('DOMContentLoaded', function() {
    // Game files configuration
    const gameFiles = [
        { file: "index.html", title: "🏠 Home" },
        { file: "pac-man.html", title: "Pac-Man" },
        { file: "tetris.html", title: "Tetris" },
        { file: "snake.html", title: "Snake" },
        { file: "breakout.html", title: "Breakout" },
        { file: "frogger.html", title: "Frogger" },
        { file: "pong.html", title: "Pong" },
        { file: "maths-invaders.html", title: "Maths Invaders" },
        { file: "spelling-invaders.html", title: "Spelling Invaders" }
    ];

    // Find existing navigation elements
    const existingNav = document.getElementById('gameNav');
    
    if (existingNav) {
        // Update existing navigation with new structure
        updateExistingNavigation(existingNav);
    } else {
        // Create new navigation if it doesn't exist
        createNewNavigation();
    }

    // Add home button to all game pages
    addHomeButton();
});

function updateExistingNavigation(navElement) {
    // Clear existing content
    navElement.innerHTML = '';
    
    // Add new navigation structure
    const strong = document.createElement('strong');
    strong.textContent = 'Games:';
    navElement.appendChild(strong);
    
    // Add navigation links
    gameFiles.forEach(game => {
        const link = document.createElement('a');
        link.href = game.file;
        link.textContent = game.title;
        link.className = 'nav-link';
        
        // Add hover effects
        link.addEventListener('mouseenter', () => {
            link.style.textDecoration = 'underline';
        });
        link.addEventListener('mouseleave', () => {
            link.style.textDecoration = 'none';
        });
        
        navElement.appendChild(link);
    });
    
    // Highlight current page
    highlightCurrentPage();
}

function createNewNavigation() {
    // Find the body or main container
    const body = document.body;
    const firstElement = body.firstElementChild;
    
    if (firstElement) {
        const nav = document.createElement('nav');
        nav.id = 'gameNav';
        nav.className = 'game-nav';
        nav.style.cssText = 'padding:15px; background:#111; color:#0f0; font-family:monospace; border-radius:5px; margin-bottom:20px; border:1px solid #0f0;';
        
        // Add navigation content
        const strong = document.createElement('strong');
        strong.textContent = 'Games:';
        nav.appendChild(strong);
        
        gameFiles.forEach(game => {
            const link = document.createElement('a');
            link.href = game.file;
            link.textContent = game.title;
            link.style.cssText = 'display:block; color:#0f0; text-decoration:none; padding:5px 0; margin:2px 0; transition:all 0.3s ease; text-transform:uppercase;';
            
            // Add hover effects
            link.addEventListener('mouseenter', () => {
                link.style.color = '#ffd700';
                link.style.textDecoration = 'underline';
            });
            link.addEventListener('mouseleave', () => {
                link.style.color = '#0f0';
                link.style.textDecoration = 'none';
            });
            
            nav.appendChild(link);
        });
        
        // Insert navigation at the beginning
        body.insertBefore(nav, firstElement);
        
        // Highlight current page
        highlightCurrentPage();
    }
}

function highlightCurrentPage() {
    const currentFile = window.location.pathname.split("/").pop() || 'index.html';
    const navLinks = document.querySelectorAll("#gameNav a");
    
    navLinks.forEach(link => {
        const linkFile = link.getAttribute("href");
        if (linkFile === currentFile) {
            link.classList.add("active");
            link.style.color = "#ffd700";
            link.style.fontWeight = "bold";
            link.style.textDecoration = "underline";
        }
    });
}

function addHomeButton() {
    // Only add home button to game pages (not the main index)
    if (window.location.pathname.includes('.html') && !window.location.pathname.includes('index.html')) {
        // Look for existing game containers to add home button
        const gameContainer = document.querySelector('.app, #container, .game-wrap') || document.body;
        
        if (gameContainer) {
            const homeButton = document.createElement('a');
            homeButton.href = 'index.html';
            homeButton.textContent = '🏠 Back to Games';
            homeButton.style.cssText = 'position:fixed; top:20px; right:20px; background:#111; color:#0f0; padding:10px 15px; text-decoration:none; border:2px solid #0f0; border-radius:5px; font-weight:bold; z-index:1000; transition:all 0.3s ease;';
            
            // Add hover effects
            homeButton.addEventListener('mouseenter', () => {
                homeButton.style.background = '#0f0';
                homeButton.style.color = '#000';
                homeButton.style.boxShadow = '0 0 20px #0f0';
            });
            homeButton.addEventListener('mouseleave', () => {
                homeButton.style.background = '#111';
                homeButton.style.color = '#0f0';
                homeButton.style.boxShadow = 'none';
            });
            
            document.body.appendChild(homeButton);
        }
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to go home
    if (e.key === 'Escape') {
        if (window.location.pathname.includes('.html') && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
    
    // H key to go home
    if (e.key === 'h' || e.key === 'H') {
        if (window.location.pathname.includes('.html') && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
});
