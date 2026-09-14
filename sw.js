const CACHE_NAME = 'slopro-public-shell-v9-preflight-safety';
const FILES = ['./', './index.html', './styles.css', './config.js', './app.js', './manifest.webmanifest'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES))));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('slopro-public-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))));
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});

