const CACHE_NAME = "body-coach-v5";
const STATIC_CACHE = "body-coach-static-v5";
const OFFLINE_URL = "/offline";

const CORE_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      );
      // Do not clients.claim() here — claiming mid-navigation on hard refresh
      // races with in-flight document requests and can trigger false offline fallbacks.
    })()
  );
});

const isOnline = () =>
  typeof self.navigator === "undefined" ? true : self.navigator.onLine;

const sameOrigin = (url) => url.origin === self.location.origin;

const isNetworkOnlyRequest = (url, request) => {
  if (url.pathname.startsWith("/api/")) return true;
  if (url.pathname.startsWith("/account")) return true;
  if (url.pathname.startsWith("/auth")) return true;
  if (url.pathname.startsWith("/admin")) return true;
  if (url.pathname.startsWith("/settings")) return true;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return true;
  if (url.pathname.startsWith("/_next/data/")) return true;
  if (url.searchParams.has("_rsc")) return true;
  if (request.headers.get("rsc") === "1") return true;
  if (request.headers.get("next-router-prefetch") === "1") return true;
  if (request.headers.get("next-router-state-tree")) return true;
  return false;
};

const isImmutableStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname === "/manifest.webmanifest";

const isCacheableNavigation = (url) => {
  const path = url.pathname;
  if (
    path.startsWith("/results") ||
    path.startsWith("/session") ||
    path.startsWith("/account") ||
    path.startsWith("/auth") ||
    path.startsWith("/admin") ||
    path.startsWith("/settings") ||
    path.startsWith("/assessment") ||
    path.startsWith("/day") ||
    path.startsWith("/feedback") ||
    path.startsWith("/tools")
  ) {
    return false;
  }
  return path === "/" || path.startsWith("/offline");
};

const putInCache = async (cacheName, request, response) => {
  if (!response || !response.ok || response.type === "opaque") return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
};

const fetchFromNetwork = (request) => fetch(request);

const fetchWithRetry = async (request) => {
  try {
    return await fetch(request);
  } catch (error) {
    if (!isOnline()) throw error;
    return fetch(request);
  }
};

const handleNavigation = async (request) => {
  const url = new URL(request.url);

  if (isOnline()) {
    try {
      const response = await fetchWithRetry(request);
      if (response.ok && isCacheableNavigation(url)) {
        void putInCache(CACHE_NAME, request, response.clone());
      }
      return response;
    } catch (error) {
      const cachedRoute = await caches.match(request);
      if (cachedRoute) return cachedRoute;
      throw error;
    }
  }

  const cachedRoute = await caches.match(request);
  if (cachedRoute) return cachedRoute;

  const offline = await caches.match(OFFLINE_URL);
  if (offline) return offline;

  return fetch(request);
};

const networkFirst = async (request, cacheName = CACHE_NAME) => {
  if (isOnline()) {
    try {
      const response = await fetchWithRetry(request);
      if (response.ok) {
        void putInCache(cacheName, request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw error;
    }
  }

  const cached = await caches.match(request);
  if (cached) return cached;
  return fetch(request);
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    void putInCache(STATIC_CACHE, request, response.clone());
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!sameOrigin(url)) return;

  if (isNetworkOnlyRequest(url, request)) {
    event.respondWith(fetchFromNetwork(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isImmutableStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
