import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';

const root = resolve('dist/site');
const fixture = process.env.SITE_MANIFEST_FIXTURE ? resolve(process.env.SITE_MANIFEST_FIXTURE) : null;
const mime = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp' };
createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  const file = pathname === '/latest.json' && fixture ? fixture : resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(root) && file !== fixture) { response.writeHead(403).end(); return; }
  const target = existsSync(file) && !statSync(file).isDirectory() ? file : pathname.endsWith('/') ? resolve(root, `.${pathname}index.html`) : resolve(root, 'index.html');
  if (!existsSync(target)) { response.writeHead(404).end(); return; }
  response.setHeader('Content-Type', mime[extname(target)] ?? 'application/octet-stream');
  createReadStream(target).pipe(response);
}).listen(Number(process.env.SITE_PORT ?? 4173), '127.0.0.1');
