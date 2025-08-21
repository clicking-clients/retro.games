/**
 * Service Worker for Retro Games Collection
 * Provides caching, offline support, and performance optimization
 */

const CACHE_NAME = 'retro-games-v1.0.0';
const STATIC_CACHE = 'retro-games-static-v1.0.0';
const DYNAMIC_CACHE = 'retro-games-dynamic-v1.0.0';

// Core assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/core/base.css',
  '/core/components.css',
  '/core/responsive.css',
  '/core/gameLoader.js',
  '/core/assetLoader.js',
  '/core/responsive-utils.js',
  '/config/games.js',
  '/components/GameContainer.js',
  '/templates/GameTemplate.js'
];

// Game assets to cache
const GAME_ASSETS = [
  '/games/wormy/index.html',
  '/games/wormy/game.js',
  '/games/wormy/styles.css'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Courier+New:wght@400;700&display=swap'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return caches.open(DYNAMIC_CACHE);
      })
      .then(cache => {
        console.log('Caching game assets...');
        return cache.addAll(GAME_ASSETS);
      })
      .then(() => {
        console.log('Game assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isGameAsset(request)) {
    event.respondWith(handleGameAsset(request));
  } else if (isExternalAsset(request)) {
    event.respondWith(handleExternalAsset(request));
  } else {
    event.respondWith(handleDynamicAsset(request));
  }
});

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.some(asset => 
    url.pathname === asset || 
    url.pathname.endsWith(asset.split('/').pop())
  );
}

/**
 * Check if request is for a game asset
 */
function isGameAsset(request) {
  const url = new URL(request.url);
  return GAME_ASSETS.some(asset => 
    url.pathname === asset || 
    url.pathname.endsWith(asset.split('/').pop())
  );
}

/**
 * Check if request is for an external asset
 */
function isExternalAsset(request) {
  const url = new URL(request.url);
  return EXTERNAL_ASSETS.some(asset => 
    url.href === asset || 
    url.href.startsWith(asset)
  );
}

/**
 * Handle static asset requests
 */
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Static asset fetch failed:', error);
    
    // Return offline page or fallback
    return getOfflineResponse(request);
  }
}

/**
 * Handle game asset requests
 */
async function handleGameAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Game asset fetch failed:', error);
    
    // Return offline page or fallback
    return getOfflineResponse(request);
  }
}

/**
 * Handle external asset requests
 */
async function handleExternalAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('External asset fetch failed:', error);
    
    // Return offline page or fallback
    return getOfflineResponse(request);
  }
}

/**
 * Handle dynamic asset requests
 */
async function handleDynamicAsset(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Dynamic asset fetch failed:', error);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or fallback
    return getOfflineResponse(request);
  }
}

/**
 * Get offline response
 */
async function getOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Try to serve offline page for HTML requests
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // Return a simple offline message
  return new Response(
    `Offline: ${url.pathname} is not available offline.`,
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    }
  );
}

/**
 * Handle background sync
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

/**
 * Perform background sync
 */
async function performBackgroundSync() {
  try {
    // Sync game data, scores, etc.
    console.log('Performing background sync...');
    
    // Example: sync high scores
    const highScores = await getHighScoresFromIndexedDB();
    if (highScores.length > 0) {
      await syncHighScoresToServer(highScores);
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Handle push notifications
 */
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from Retro Games Collection',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag || 'retro-games',
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'play',
          title: 'Play Now',
          icon: '/play-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/dismiss-icon.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Retro Games Collection', options)
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'play') {
    // Open the game
    event.waitUntil(
      clients.openWindow('/index.html')
    );
  } else if (event.action === 'dismiss') {
    // Do nothing, notification already closed
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/index.html')
    );
  }
});

/**
 * Handle message events from main thread
 */
self.addEventListener('message', (event) => {
  console.log('Service Worker message received:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_GAME':
      cacheGameAssets(data.gameId);
      break;
      
    case 'CLEAR_CACHE':
      clearCache();
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo(event.source);
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

/**
 * Cache game assets
 */
async function cacheGameAssets(gameId) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    // Cache game-specific assets
    const gameAssets = [
      `/games/${gameId}/index.html`,
      `/games/${gameId}/game.js`,
      `/games/${gameId}/styles.css`
    ];
    
    const promises = gameAssets.map(url => 
      fetch(url)
        .then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        })
        .catch(error => {
          console.warn(`Failed to cache ${url}:`, error);
        })
    );
    
    await Promise.all(promises);
    console.log(`Game assets cached for: ${gameId}`);
  } catch (error) {
    console.error('Failed to cache game assets:', error);
  }
}

/**
 * Clear cache
 */
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Get cache information
 */
async function getCacheInfo(client) {
  try {
    const cacheNames = await caches.keys();
    const cacheInfo = {};
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      cacheInfo[name] = keys.length;
    }
    
    client.postMessage({
      type: 'CACHE_INFO',
      data: cacheInfo
    });
  } catch (error) {
    console.error('Failed to get cache info:', error);
    client.postMessage({
      type: 'CACHE_INFO',
      data: { error: error.message }
    });
  }
}

/**
 * Helper functions for background sync
 */
async function getHighScoresFromIndexedDB() {
  // This would typically interact with IndexedDB
  // For now, return empty array
  return [];
}

async function syncHighScoresToServer(highScores) {
  // This would typically send data to a server
  // For now, just log the scores
  console.log('Syncing high scores:', highScores);
}

// Log service worker status
console.log('Service Worker loaded successfully');
