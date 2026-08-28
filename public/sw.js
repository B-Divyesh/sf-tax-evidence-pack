const cache = 'tax-evidence-pack-site-v1';
const shell = ['/', '/privacy/', '/terms/', '/site.css', '/evidence-binder.webp'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(cache).then((store) => store.addAll(shell)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => { if (event.request.method !== 'GET') return; event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))); });
