// Service Worker — actualizá CACHE_VERSION en cada deploy para forzar nueva caché
// v5: HTML/JS van primero a la red (evita app vieja tras subir cambios a GitHub Pages)

const CACHE_VERSION = 'v5';
const CACHE_NAME = `inspeccionapp-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/InspeccionApp-Copetran/',
  '/InspeccionApp-Copetran/index.html',
  '/InspeccionApp-Copetran/ICON.png',
  '/InspeccionApp-Copetran/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname === 'script.google.com') {
    event.respondWith(
      fetch(event.request).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  const path = url.pathname;
  const redPrimero =
    url.origin !== self.location.origin ||
    event.request.mode === 'navigate' ||
    path.endsWith('.html') ||
    path.endsWith('.js') ||
    path.includes('/_expo/') ||
    path.includes('/assets/');

  if (redPrimero && url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
