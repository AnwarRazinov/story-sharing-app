const CACHE_NAME = 'dicoding-story-v1';
const SHELL_CACHE = 'dicoding-story-shell-v1';
const DATA_CACHE = 'dicoding-story-data-v1';
const API_CACHE_MAX_AGE = 60 * 60 * 1000; // 1 hour in ms

// Application Shell resources (static assets)
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/styles/main.css',
  '/src/styles/transitions.css',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  // Add your main JS bundle if served from root, e.g. '/bundle.a41a1abdaf94ee66c352.js'
];

// Helper: Clean up old API cache entries
async function cleanApiCache(cache) {
  const requests = await cache.keys();
  const now = Date.now();
  await Promise.all(requests.map(async (request) => {
    const response = await cache.match(request);
    if (!response) return;
    const dateHeader = response.headers.get('sw-cache-date');
    if (dateHeader && now - Number(dateHeader) > API_CACHE_MAX_AGE) {
      await cache.delete(request);
    }
  }));
}

// Install event - cache shell resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(SHELL_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== SHELL_CACHE && key !== DATA_CACHE) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests (Network First strategy with cache expiry and fallback)
  if (url.origin === 'https://story-api.dicoding.dev') {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        await cleanApiCache(cache);
        return fetch(request)
          .then((response) => {
            // Only cache GET requests
            if (request.method === 'GET') {
              // Clone and add a custom header for cache date
              const cacheResponse = (async () => {
                const cloned = response.clone();
                const headers = new Headers(cloned.headers);
                headers.append('sw-cache-date', Date.now().toString());
                const body = await cloned.blob();
                return new Response(body, { status: cloned.status, statusText: cloned.statusText, headers });
              })();
              cacheResponse.then(cachedResponse => cache.put(request, cachedResponse));
            }
            return response;
          })
          .catch(async () => {
            // Return cached data if network fails
            const cached = await cache.match(request);
            if (cached) return cached;
            // Fallback: return a generic error response
            return new Response(JSON.stringify({ error: 'Offline and no cached data available.' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
    );
    return;
  }

  // Handle navigation requests (App Shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // Handle static assets (Cache First strategy)
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(SHELL_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Push notification handling
self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || "Dicoding Story";
  const options = {
    body: data.options?.body || "New notification",
    icon: "/images/icons/icon-192x192.png",
    badge: "/images/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    tag: 'story-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});