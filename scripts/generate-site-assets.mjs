import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const output = process.argv[2] ?? 'dist/site';
const assetDir = join(output, 'assets');
const assetNames = (await readdir(assetDir)).sort();
const assets = assetNames.map((name) => `/assets/${name}`);
const shell = ['/', '/demo/', '/privacy/', '/terms/', '/404.html', '/evidence-binder.webp', '/favicon.svg', '/site.webmanifest', ...assets];
const version = createHash('sha256').update((await Promise.all(assetNames.map((name) => readFile(join(assetDir, name))))).map((bytes) => bytes.toString('base64')).join('')).digest('hex').slice(0, 12);
const source = `const cache = 'tax-evidence-pack-site-${version}';
const shell = ${JSON.stringify(shell)};
self.addEventListener('install', (event) => event.waitUntil(caches.open(cache).then((store) => store.addAll(shell)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil((async () => { for (const key of await caches.keys()) if (key.startsWith('tax-evidence-pack-site-') && key !== cache) await caches.delete(key); await self.clients.claim(); })()));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const store = await caches.open(cache);
    try { const response = await fetch(event.request); if (response.ok) store.put(event.request, response.clone()); return response; }
    catch { return (await store.match(event.request)) || (event.request.mode === 'navigate' ? await store.match('/404.html') : Response.error()); }
  })());
});
`;
await writeFile(join(output, 'sw.js'), source);
console.log(`wrote ${join(output, 'sw.js')} (${shell.length} precache entries)`);
