// service-worker.js
// Service Worker para InspeccionApp PWA — Estrategia Cache-First para assets estáticos

const CACHE_NAME = 'inspeccionapp-v1';

// Archivos que se cachean en la instalación
const PRECACHE_URLS = [
  '/InspeccionApp-Copetran/',
  '/InspeccionApp-Copetran/index.html',
  '/InspeccionApp-Copetran/logoouser.png',
  '/InspeccionApp-Copetran/manifest.json',
];

// ── Instalación: precachear assets críticos ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activación: limpiar cachés viejas ───────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: Network-first para API, Cache-first para assets ───────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Peticiones al Apps Script (API) — siempre ir a la red
  if (url.hostname === 'script.google.com') {
    event.respondWith(fetch(event.request).catch(() => new Response('Offline', { status: 503 })));
    return;
  }

  // Assets estáticos — Cache-first con fallback a red
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Solo cachear respuestas válidas de mismo origen
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
