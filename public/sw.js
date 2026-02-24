// Professional Service Worker for X-CODE 11 IDE
// Advanced caching, background sync, and offline support

const CACHE_VERSION = 'v1-xcode11-2026';
const RUNTIME_CACHE = 'runtime-xcode11';
const ASSET_CACHE = 'assets-xcode11';
const API_CACHE = 'api-xcode11';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/script.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - Pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing X-CODE 11 Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Pre-cache essential assets
      caches.open(CACHE_VERSION).then((cache) => {
        console.log('[Service Worker] Caching essential assets');
        return cache.addAll(PRECACHE_ASSETS);
      }),
      // Open runtime cache
      caches.open(RUNTIME_CACHE),
      // Open asset cache
      caches.open(ASSET_CACHE),
      // Open API cache
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('[Service Worker] Pre-cache complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating X-CODE 11 Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== ASSET_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Cache cleanup complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - Intelligent routing based on request type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network first with fallback to cache
  if (pathname.startsWith('/api/')) {
    event.respondWith(apiRequestHandler(event.request));
    return;
  }

  // Image, font, and media assets - Cache first with network fallback
  if (isAsset(pathname)) {
    event.respondWith(assetRequestHandler(event.request));
    return;
  }

  // HTML documents - Network first with cache fallback
  if (pathname.endsWith('.html') || pathname === '/') {
    event.respondWith(htmlRequestHandler(event.request));
    return;
  }

  // Default - Cache first with network fallback
  event.respondWith(defaultRequestHandler(event.request));
});

// Network first strategy for HTML documents
async function htmlRequestHandler(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[Service Worker] Network error, trying cache:', error);
  }
  
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  return new Response('Offline - Page not available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain'
    })
  });
}

// Network first strategy for API calls
async function apiRequestHandler(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[Service Worker] API network error:', error);
  }
  
  const cached = await caches.match(request);
  return cached || new Response(
    JSON.stringify({ error: 'Offline - API unavailable' }),
    {
      status: 503,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }
  );
}

// Cache first strategy for static assets
async function assetRequestHandler(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(ASSET_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[Service Worker] Asset fetch error:', error);
  }

  // Return placeholder for missing assets
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ddd" width="100" height="100"/></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }

  return new Response('Asset not available offline', { status: 404 });
}

// Default strategy - Cache first, network fallback
async function defaultRequestHandler(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[Service Worker] Fetch error:', error);
  }

  return new Response('Offline - Resource unavailable', { status: 503 });
}

// Helper function to determine if request is for a static asset
function isAsset(pathname) {
  const assetExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.css', '.js'];
  return assetExtensions.some(ext => pathname.endsWith(ext));
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);
  
  if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects());
  } else if (event.tag === 'sync-files') {
    event.waitUntil(syncFiles());
  }
});

async function syncProjects() {
  console.log('[Service Worker] Syncing projects...');
  try {
    // Sync project data when connection is restored
    const cache = await caches.open(API_CACHE);
    const projects = await cache.match('/api/projects');
    if (projects) {
      await fetch('/api/projects', {
        method: 'POST',
        body: projects.body
      });
    }
  } catch (error) {
    console.error('[Service Worker] Projects sync failed:', error);
  }
}

async function syncFiles() {
  console.log('[Service Worker] Syncing files...');
  try {
    // Sync file changes when connection is restored
    const cache = await caches.open(API_CACHE);
    const files = await cache.match('/api/files');
    if (files) {
      await fetch('/api/files', {
        method: 'POST',
        body: files.body
      });
    }
  } catch (error) {
    console.error('[Service Worker] Files sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  let notificationData = {
    title: 'X-CODE 11',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png'
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: 'xcode11-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open',
          icon: '/icons/open.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/close.png'
        }
      ]
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Message handlers for client communication
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      ).then(() => {
        console.log('[Service Worker] All caches cleared');
        event.ports[0].postMessage({ success: true });
      });
    });
  }
  
  if (event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ size });
    });
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Calculate total cache size
async function getCacheSize() {
  let size = 0;
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        size += blob.size;
      }
    }
  }
  
  return size;
}

console.log('[Service Worker] X-CODE 11 Service Worker initialized successfully');