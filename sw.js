const CACHE_NAME = 'minimal-todo-v15-cloud';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

// Install: statikleri cache'e al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

// Fetch: online-first, hata/offline olursa cache fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // Supabase / CDN isteklerini cache'leme
  if (url.includes('supabase.co') || url.includes('unpkg.com')) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Network var ama 404/500 ise cache'e dönmeyi dene
        if (!res || res.status >= 400) return caches.match(req);
        return res;
      })
      .catch(() => caches.match(req))
  );
});