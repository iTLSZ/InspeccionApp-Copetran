// service-worker.js
// Service Worker para InspeccionApp PWA
// IMPORTANTE: este archivo se sirve desde la raíz del scope.
// Las rutas usan './' para ser relativas al scope (funciona en dev Y GitHub Pages)

const CACHE_NAME = 'inspeccionapp-v2';

// Solo cachear lo que seguro existe — sin ICON.png que no existe en dev
const PRECACHE_URLS = [
  './',
  './manifest.json',
  './logoouser.png',
];

// ── Instalación: precachear assets críticos ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        // addAll falla si UNO falla — usamos add individual con catch
        Promise.allSettled(PRECACHE_URLS.map((url) =>
          cache.add(url).catch((e) => console.warn('[SW] No se pudo cachear:', url, e.message))
        ))
      )
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

  // Solo manejar GET
  if (event.request.method !== 'GET') return;

  // Peticiones al Apps Script (API) — siempre ir a la red
  if (url.hostname === 'script.google.com') {
    event.respondWith(
      fetch(event.request).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // Assets estáticos — Cache-first con fallback a red
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
      }).catch(() => {
        // Sin red y sin caché — respuesta vacía para no romper la app
        return new Response('', { status: 503 });
      });
    })
  );
});
