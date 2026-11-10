// PROSPECT - Football Scouting Notebook
// Service Worker for offline functionality

const CACHE_NAME = 'prospect-v1';
const ASSETS_CACHE = 'prospect-assets-v1';
const DATA_CACHE = 'prospect-data-v1';

// Core assets to cache for offline use
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/favicon.svg',
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg',
  '/assets/icons/apple-touch-icon.svg',
  '/css/style.css',
  '/css/responsive.css',
  '/css/themes.css',
  '/css/components.css',
  '/js/app.js',
  '/js/database.js',
  '/js/players.js',
  '/js/scouting.js',
  '/js/notebook.js',
  '/js/analysis.js',
  '/js/pitch.js',
  '/js/exports.js',
  '/js/settings.js'
];

// Static asset patterns to cache
const ASSET_PATTERNS = [
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.css$/,
  /\.js$/
];

// Install service worker and cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch handler with offline fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache and return static assets
  if (ASSET_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return caches.open(ASSETS_CACHE).then((cache) => {
          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          }).catch(() => {
            // Return cached response if available, otherwise return fallback
            return cachedResponse || caches.match('/index.html');
          });
        });
      })
    );
    return;
  }

  // Cache API responses (for future server-side functionality)
  if (url.pathname.startsWith('/php/api/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(DATA_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        }).catch(() => {
          // Return cached data if available
          return caches.match(event.request);
        });
      })
    );
    return;
  }

  // For navigation requests, return the index.html (SPA-like behavior)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
    return;
  }

  // Default fetch behavior
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Background sync for future server synchronization
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncDataToServer());
  }
});

async function syncDataToServer() {
  // This will be implemented when server-side sync is added
  console.log('Background sync triggered');
}

// Push notification support (for future use)
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  const title = data?.title || 'PROSPECT';
  const options = {
    body: data?.body || 'New notification',
    icon: '/assets/icons/icon-192.svg',
    badge: '/assets/icons/favicon.svg',
    data: data?.url ? { url: data.url } : {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  } else {
    clients.openWindow('/');
  }
});
