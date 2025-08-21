// Shared Navigation for Retro Games Collection

// Game files configuration - moved to global scope
const gameFiles = [
    { file: "index.html", title: "🏠 Home" },
    { file: "chompy.html", title: "Chompy" },
    { file: "pipe-dream.html", title: "Pipe Dream" },
    { file: "block-stack.html", title: "Block Stack" },
    { file: "wormy.html", title: "Wormy" },
    { file: "bubble-pop.html", title: "Bubble Pop" },
    { file: "road-dash.html", title: "Road Dash" },
    { file: "paddle-ball.html", title: "Paddle Ball" },
    { file: "number-defenders.html", title: "Number Defenders" },
    { file: "word-defenders.html", title: "Word Defenders" }
];

// Add mobile navigation styles
function addMobileNavStyles() {
    if (!document.getElementById('mobile-nav-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-nav-styles';
        style.textContent = `
            .mobile-nav-toggle {
                display: none;
                background: var(--green, #0f0);
                color: var(--bg, #000);
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 1.2rem;
                cursor: pointer;
                margin-bottom: 10px;
                font-family: monospace;
                transition: all 0.2s;
            }
            
            .mobile-nav-toggle:hover,
            .mobile-nav-toggle:focus {
                background: var(--yellow, #ff0);
                color: var(--bg, #000);
            }
            
            .mobile-nav-content {
                display: block;
            }
            
            @media (max-width: 767px) {
                .mobile-nav-toggle {
                    display: block;
                }
                
                .mobile-nav-content {
                    display: none;
                }
                
                .mobile-nav-content.open {
                    display: block;
                }
                
                #gameNav {
                    flex-direction: column;
                    align-items: center;
                }
                
                #gameNav a {
                    width: 100%;
                    text-align: center;
                    padding: 12px;
                    margin: 2px 0;
                    border-radius: 5px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Add mobile navigation styles
    addMobileNavStyles();
    
    // Add mobile toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-nav-toggle';
    toggleBtn.textContent = '☰ Games Menu';
    toggleBtn.setAttribute('aria-label', 'Toggle games menu');
    
    // Add toggle functionality
    toggleBtn.addEventListener('click', () => {
        const content = navElement.querySelector('.mobile-nav-content');
        content.classList.toggle('open');
        toggleBtn.textContent = content.classList.contains('open') ? '✕ Close' : '☰ Games Menu';
    });
    
    navElement.appendChild(toggleBtn);
    
    // Create navigation content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'mobile-nav-content';
    
    // Add navigation structure
    const strong = document.createElement('strong');
    strong.textContent = 'Games:';
    contentWrapper.appendChild(strong);
    
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
        
        contentWrapper.appendChild(link);
    });
    
    navElement.appendChild(contentWrapper);
    
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
        
        // Add mobile navigation styles
        addMobileNavStyles();
        
        // Add mobile toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-nav-toggle';
        toggleBtn.textContent = '☰ Games Menu';
        toggleBtn.setAttribute('aria-label', 'Toggle games menu');
        
        // Add toggle functionality
        toggleBtn.addEventListener('click', () => {
            const content = nav.querySelector('.mobile-nav-content');
            content.classList.toggle('open');
            toggleBtn.textContent = content.classList.contains('open') ? '✕ Close' : '☰ Games Menu';
        });
        
        nav.appendChild(toggleBtn);
        
        // Create navigation content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'mobile-nav-content';
        
        // Add navigation content
        const strong = document.createElement('strong');
        strong.textContent = 'Games:';
        contentWrapper.appendChild(strong);
        
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
            
            contentWrapper.appendChild(link);
        });
        
        nav.appendChild(contentWrapper);
        
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
