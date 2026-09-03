const CACHE_NAME = "buse-app-v2";
const ASSETS_TO_CACHE = ["/", "/index.html", "/logo.jpeg", "/manifest.json"];

// Install — cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache.
//
// Only same-origin GET requests are touched. Supabase calls are cross-origin
// and often non-GET; caching them would both fail (cache.put rejects on POST)
// and risk serving stale rows after a write.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, clone))
          .catch(() => {});
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
