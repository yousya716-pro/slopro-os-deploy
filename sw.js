const CACHE_NAME = 'slopro-public-shell-v53-all-targets-first';
const FILES = ['./', './index.html', './styles.css', './decision-ui.css', './field-reference-rollout-v6.css', './config.js', './app-all-targets-20261002.js', './all-targets-reference-20261002.js', './all-targets-reference-20261002.css', './original-source-reference-evidence-20261002.js', './original-source-reference-20261002-dense.css',
  './field-target-ui-v5.js', './carousel-source-diagnostic-20261002.js', './carousel-diagnostic-20261001.css', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SLOPRO_CAROUSEL_DIAG_VERSION' && event.ports?.[0]) event.ports[0].postMessage({cache_name: CACHE_NAME});
});
