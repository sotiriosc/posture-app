const CACHE_NAME = "body-coach-v4";
const CORE_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const { request } = event;
  const url = new URL(request.url);
  const isNavigation = request.mode === "navigate";
  const isImage = request.destination === "image";
  const isApiRequest = url.pathname.startsWith("/api/");
  // Account/billing must never be served from SW cache — always network.
  const isAccountRoute = url.pathname.startsWith("/account");

  if (isApiRequest || isAccountRoute) {
    event.respondWith(fetch(request));
    return;
  }

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache marketing/static navigations, not authenticated app routes.
          if (!url.pathname.startsWith("/results") && !url.pathname.startsWith("/session")) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match("/offline"))
    );
    return;
  }

  if (isImage) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
