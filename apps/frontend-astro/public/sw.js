const CACHE = "loto-v1";
const STATIC = ["/_astro/", "/icons/", "/favicon.svg"];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Network-first para API y páginas dinámicas
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first para assets estáticos
  if (STATIC.some((p) => url.pathname.startsWith(p))) {
    e.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((hit) => {
          const fetchPromise = fetch(request).then((res) => {
            cache.put(request, res.clone());
            return res;
          });
          return hit ?? fetchPromise;
        })
      )
    );
    return;
  }

  // Network-first con fallback a cache para páginas HTML
  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
