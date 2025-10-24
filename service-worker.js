
const CACHE_NAME = 'clinconnect-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/lang/main_en.js',
  './js/lang/main_hi.js',
  './js/lang/main_pa.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') { return; }
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});
