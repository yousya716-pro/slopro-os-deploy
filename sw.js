const CACHE_NAME = 'slopro-public-shell-v33-field-reference';
const FILES = ['./', './index.html', './styles.css', './decision-ui.css', './field-reference.css','./field-reference-v6.css','./field-reference-v7.css','./field-reference-v8.css','./field-reference-v9.css','./field-reference-v10.css','./field-reference-v11.css', './config.js', './app.js', './field-reference.js','./field-reference-v2.js','./field-reference-v3.js','./field-reference-v4.js', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('slopro-public-shell-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
