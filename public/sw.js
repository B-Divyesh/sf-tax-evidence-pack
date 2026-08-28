const cache = 'tax-evidence-pack-site-v2';
const shell = ['/', '/privacy/', '/terms/', '/site.css', '/release.css', '/evidence-binder.webp', '/latest.json'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(cache).then((store) => store.addAll(shell)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const store = await caches.open(cache);
    try {
      const response = await fetch(event.request);
      if (response.ok) store.put(event.request, response.clone());
      return response;
    } catch {
      return (await caches.match(event.request)) || (event.request.mode === 'navigate' ? await caches.match('/') : Response.error());
    }
  })());
});
