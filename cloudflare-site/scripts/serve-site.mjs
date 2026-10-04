import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

const server = createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const file = path.resolve(root, pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''));
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  let body;
  let status = 200;
  let servedFile = file;
  try {
    body = await readFile(file);
  } catch {
    status = 404;
    servedFile = path.join(root, '404.html');
    body = await readFile(servedFile);
  }

  response.writeHead(status, {
    'Content-Type': contentTypes.get(path.extname(servedFile).toLowerCase()) ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(request.method === 'HEAD' ? undefined : body);
});

const port = Number(process.env.PORT ?? 4183);
server.listen(port, '127.0.0.1', () => {
  console.log(`TrayPilot light site: http://127.0.0.1:${port}`);
});
