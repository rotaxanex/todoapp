const CACHE_NAME = 'minimal-todo-v15-cloud'; // Versiyonu değiştirdik
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  // Eğer ikonların varsa buraya ekle:
  // './icon-192.png',
  // './icon-512.png'
];

// 1. Kurulum (Install) - Dosyaları hafızaya al
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Yeni SW hemen aktif olsun
});

// 2. Aktifleştirme (Activate) - Eski versiyonları sil
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eski cache siliniyor:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Yakalama (Fetch) - İnternet varsa oradan, yoksa hafızadan
self.addEventListener('fetch', (e) => {
  // Supabase isteklerini veya dış linkleri cache'lemeye çalışma (Hata verir)
  if (e.request.url.includes('supabase.co') || e.request.url.includes('unpkg.com')) {
    return; // Bunları tarayıcı normal yoldan çeksin
  }

  e.respondWith(
    fetch(e.request)
      .catch(() => {
        // İnternet yoksa cache'e bak
        return caches.match(e.request);
      })
  );
});