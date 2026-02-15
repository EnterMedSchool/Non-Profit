/**
 * Service Worker for EnterMedSchool.org
 * Cache-first for static assets, network-first for pages
 * Includes offline fallback and cache size management
 */

const CACHE_NAME = "ems-org-v2";
const MAX_CACHE_ENTRIES = 80;
const MAX_CACHE_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const STATIC_ASSETS = [
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/icon.png",
  "/offline.html",
];

// Install: pre-cache essential static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/**
 * Trim cache to MAX_CACHE_ENTRIES by removing oldest entries first.
 */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  // Remove oldest entries (FIFO)
  const toDelete = keys.slice(0, keys.length - maxEntries);
  await Promise.all(toDelete.map((key) => cache.delete(key)));
}

// Fetch: network-first for pages, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Static assets: cache-first
  if (
    url.pathname.match(
      /\.(png|jpg|jpeg|svg|ico|webp|avif|woff2|woff|ttf|css|js)$/
    )
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, clone))
                .then(() => trimCache(CACHE_NAME, MAX_CACHE_ENTRIES));
            }
            return response;
          })
      )
    );
    return;
  }

  // Pages: network-first with cache fallback + offline fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone))
              .then(() => trimCache(CACHE_NAME, MAX_CACHE_ENTRIES));
          }
          return response;
        })
        .catch(
          () =>
            caches.match(request).then(
              (cached) => cached || caches.match("/offline.html")
            )
        )
    );
    return;
  }
});
