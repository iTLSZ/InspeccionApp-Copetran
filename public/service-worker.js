// service-worker.js
// Service Worker para InspeccionApp PWA
// IMPORTANTE: este archivo se sirve desde la raíz del scope.

// ⚠️ Cambia este número cada vez que hagas un deploy para forzar actualización inmediata.
const CACHE_VERSION = 4;
const CACHE_NAME = `inspeccionapp-v${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './manifest.json',
  './logoouser.png',
];

// ── Instalación ──────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((e) => console.warn('[SW] No se pudo cachear:', url, e.message))
        )
      )
    )
  );
  // Tomar control inmediatamente, sin esperar a que cierren las pestañas viejas
  self.skipWaiting();
});

// ── Activación: limpiar cachés viejas ───────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => {
        console.log('[SW] Eliminando caché vieja:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  // API de Google Apps Script — siempre red
  if (url.hostname === 'script.google.com') {
    event.respondWith(
      fetch(event.request).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // HTML (páginas) — Network-first: siempre intenta obtener la versión más nueva.
  // Si no hay red, sirve del caché como fallback.
  const isHTMLRequest =
    event.request.headers.get('accept')?.includes('text/html') ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/';

  if (isHTMLRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // JS, imágenes, CSS — Cache-first con fallback a red (para funcionamiento offline)
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
      }).catch(() => new Response('', { status: 503 }));
    })
  );
});
