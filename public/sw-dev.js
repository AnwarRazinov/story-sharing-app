// Development service worker - tidak melakukan caching
self.addEventListener("install", () => {
  console.log("Development service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Development service worker activated");
});

self.addEventListener("fetch", () => {
  // Tidak melakukan apapun, biarkan request berjalan normal
});
