// Development service worker with basic offline support
const CACHE_NAME = 'dev-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[SW Dev] Installing...');
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
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For development, just log requests
  console.log('[SW Dev] Fetching:', event.request.url);
  
  // Basic offline fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log('[SW Dev] Serving from cache:', event.request.url);
            return response;
          }
          // Fallback to index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
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
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW Dev] Notification click:', event);
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});