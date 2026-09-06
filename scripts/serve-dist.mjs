import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';

const root = resolve('dist/site');
const fixture = process.env.SITE_MANIFEST_FIXTURE ? resolve(process.env.SITE_MANIFEST_FIXTURE) : null;
const mime = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp' };
createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  const route = pathname === '/demo' ? '/demo/index.html' : pathname === '/privacy' ? '/privacy/index.html' : pathname === '/terms' ? '/terms/index.html' : pathname;
  const file = pathname === '/latest.json' && fixture ? fixture : resolve(root, `.${route === '/' ? '/index.html' : route}`);
  if (!file.startsWith(root) && file !== fixture) { response.writeHead(403).end(); return; }
  const target = existsSync(file) && !statSync(file).isDirectory() ? file : route.endsWith('/') ? resolve(root, `.${route}index.html`) : resolve(root, '404.html');
  const status = existsSync(file) || route.endsWith('/') && existsSync(target) ? 200 : 404;
  if (!existsSync(target)) { response.writeHead(404).end(); return; }
  response.statusCode = status;
  response.setHeader('Content-Type', mime[extname(target)] ?? 'application/octet-stream');
  createReadStream(target).pipe(response);
}).listen(Number(process.env.SITE_PORT ?? 4173), '127.0.0.1');
