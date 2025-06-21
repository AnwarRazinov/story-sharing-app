// Development service worker with proper path handling
const CACHE_NAME = 'dev-cache-v1';
const DATA_CACHE = 'dev-data-cache-v1';

// Determine base path based on current location
const getBasePath = () => {
  const currentPath = self.location.pathname;
  if (currentPath.includes('/story-sharing-app/')) {
    return '/story-sharing-app';
  }
  return '';
};

const basePath = getBasePath();

const urlsToCache = [
  `${basePath}/`,
  `${basePath}/index.html`,
  `${basePath}/manifest.json`
];

self.addEventListener('install', (event) => {
  console.log('[SW Dev] Installing... Base path:', basePath);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW Dev] Caching basic files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('[SW Dev] Cache failed:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW Dev] Activating...');
  event.waitUntil(
    // Clean up old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE) {
            console.log('[SW Dev] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  console.log('[SW Dev] Fetching:', request.url);

  // Handle API requests with Network First strategy
  if (url.origin === 'https://story-api.dicoding.dev') {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful GET requests
            if (request.method === 'GET' && response.status === 200) {
              console.log('[SW Dev] Caching API response:', request.url);
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch((error) => {
            console.log('[SW Dev] Network failed, trying cache:', request.url);
            // Try to serve from cache if network fails
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW Dev] Serving API from cache:', request.url);
                return cachedResponse;
              }
              // If not in cache, return a basic error response
              console.log('[SW Dev] No cache available for:', request.url);
              throw error;
            });
          });
      })
    );
    return;
  }

  // Handle all other requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch((error) => {
        console.log('[SW Dev] Network failed for:', request.url);
        
        // Try to serve from cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW Dev] Serving from cache:', request.url);
              return cachedResponse;
            }
            
            // For navigation requests, serve the main page
            if (request.mode === 'navigate') {
              console.log('[SW Dev] Serving fallback page for navigation');
              return caches.match(`${basePath}/index.html`);
            }
            
            // For other requests, just fail
            throw error;
          });
      })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW Dev] Push received:', event);
  
  const title = 'Development Push Test';
  const options = {
    body: 'Push notification working in development!',
    icon: `${basePath}/icon-192x192.png`,
    badge: `${basePath}/icon-192x192.png`
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW Dev] Notification click:', event);
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(`${basePath}/`)
  );
});