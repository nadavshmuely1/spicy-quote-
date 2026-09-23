const CACHE_NAME = 'spicy-quote-v16';
const CORE_ASSETS = [
  './',
  './index.html',
  './fonts.css',
  './styles.css',
  './app.js',
  './manifest.json',
  './assets/spicy-logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // no third-party scripts left to skip, but stay safe

  // network-first: תמיד מנסים לקבל את הגרסה העדכנית קודם, ורק אם אין רשת
  // (למשל היא באזור בלי קליטה) נופלים חזרה לעותק השמור מהפעם האחרונה.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
