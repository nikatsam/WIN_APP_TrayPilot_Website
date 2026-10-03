import assert from 'node:assert/strict';

const origin = process.argv[2] ?? 'http://127.0.0.1:4173';
const pageRoutes = [
  '/',
  '/help.html',
  '/404.html',
  '/robots.txt',
  '/sitemap.xml',
  '/styles.css',
  '/site.js',
  '/assets/store-logo.png',
  '/assets/screenshot-dashboard.png',
  '/assets/screenshot-shortcut.png',
];
const checkedRoutes = new Map();
const failures = [];

async function request(route, expectedStatus = 200) {
  const url = new URL(route, origin);
  const response = await fetch(url);
  if (response.status !== expectedStatus) {
    failures.push(`${route}: expected HTTP ${expectedStatus}, received ${response.status}`);
  }
  const extension = url.pathname.split('.').at(-1).toLowerCase();
  const expectedType = new Map([
    ['css', 'text/css'],
    ['html', 'text/html'],
    ['js', 'text/javascript'],
    ['png', 'image/png'],
    ['txt', 'text/plain'],
    ['xml', 'application/xml'],
  ]).get(extension);
  if (expectedType && !response.headers.get('content-type')?.startsWith(expectedType)) {
    failures.push(`${route}: expected Content-Type ${expectedType}, received ${response.headers.get('content-type')}`);
  }
  const body = await response.text();
  checkedRoutes.set(url.pathname, { body, response });
  return { body, response };
}

for (const route of pageRoutes) await request(route);

for (const [route, { body }] of checkedRoutes) {
  if (!route.endsWith('.html') || route.startsWith('/assets/')) continue;
  for (const match of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    const target = new URL(value, new URL(route, origin));
    const result = await request(target.pathname);
    if (target.hash) {
      const id = decodeURIComponent(target.hash.slice(1));
      if (!result.body.includes(`id="${id}"`)) {
        failures.push(`${route}: anchor #${id} does not exist at ${target.pathname}`);
      }
    }
  }
}

const { body: robots } = await request('/robots.txt');
const sitemapRoute = robots.match(/^Sitemap:\s*(\S+)/mi)?.[1];
assert.ok(sitemapRoute, 'robots.txt must declare a sitemap');
const sitemapUrl = new URL(sitemapRoute);
const canonical = new URL((await request('/')).body.match(/<link rel="canonical" href="([^"]+)"/)?.[1]);
const projectPath = canonical.pathname;
assert.ok(sitemapUrl.pathname.startsWith(projectPath), 'robots.txt sitemap must be under the canonical project path');
const { body: sitemap } = await request('/sitemap.xml');
for (const [, listedUrl] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const listed = new URL(listedUrl);
  assert.equal(listed.origin, canonical.origin, `Unexpected sitemap origin: ${listed.origin}`);
  assert.ok(listed.pathname.startsWith(projectPath), `Sitemap URL is outside the project path: ${listed.pathname}`);
  const localRoute = listed.pathname.slice(projectPath.length - 1) || '/';
  await request(localRoute);
}

const { body: missingPage } = await request('/audit-intentionally-missing-page.html', 404);
assert.match(missingPage, /That page isn't/);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${checkedRoutes.size} local routes/assets returned the expected status and MIME type; navigation anchors and sitemap URLs resolve; missing URLs return the 404 page.`);
}
