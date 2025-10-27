
const CACHE_PREFIX = 'clinconnect-';
const CACHE_VERSION = 'v3';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/main.js',
  './js/pwa.js',
  './js/media.js',
  './js/checkins.js',
  './js/lang/main_en.js',
  './js/lang/main_hi.js',
  './js/lang/main_pa.js',
  './en/index.html',
  './hi/index.html',
  './pa/index.html',
  './assets/images/pgimer_logo.png',
  './assets/images/about-clinconnect.svg',
  './assets/images/hero-hospital-wing.png',
  './assets/images/hero-outpatient-clinic.png',
  './assets/images/hero-patient-counseling.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-192.png',
  './assets/icons/maskable-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try{
      await cache.addAll(CORE_ASSETS);
    } catch(err){
      console.error('SW install cache error', err);
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key)=> key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key)=> caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET'){ return; }
  event.respondWith((async ()=>{
    const cached = await caches.match(request);
    if (cached){ return cached; }
    try{
      const response = await fetch(request);
      if (response && response.status === 200 && response.type !== 'opaque'){
        const copy = response.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, copy);
      }
      return response;
    } catch(err){
      if (request.mode === 'navigate' || request.destination === 'document'){
        const fallback = await caches.match('./index.html');
        if (fallback){ return fallback; }
      }
      throw err;
    }
  })());
});
