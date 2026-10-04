import assert from 'node:assert/strict';

const origin = process.argv[2] ?? 'http://127.0.0.1:4183';
const routes = ['/', '/guide.html', '/404.html', '/robots.txt', '/sitemap.xml', '/styles.css', '/site.js', '/assets/store-logo.png', '/assets/screenshot-dashboard.png', '/assets/screenshot-shortcut.png'];
const responses = new Map();
const failures = [];

async function get(route, expected = 200) {
  const url = new URL(route, origin);
  const response = await fetch(url);
  if (response.status !== expected) failures.push(`${route}: expected HTTP ${expected}, got ${response.status}`);
  const expectedType = new Map([
    ['css', 'text/css'], ['html', 'text/html'], ['js', 'text/javascript'],
    ['png', 'image/png'], ['txt', 'text/plain'], ['xml', 'application/xml'],
  ]).get(url.pathname.split('.').at(-1).toLowerCase());
  if (expectedType && !response.headers.get('content-type')?.startsWith(expectedType)) {
    failures.push(`${route}: expected Content-Type ${expectedType}, got ${response.headers.get('content-type')}`);
  }
  const body = await response.text();
  responses.set(url.pathname, { body, response });
  return { body, response };
}

for (const route of routes) await get(route);

for (const [route, { body }] of responses) {
  if (!route.endsWith('.html')) continue;
  for (const [, raw] of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = raw.replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    const target = new URL(value, new URL(route, origin));
    const { body: targetBody } = await get(target.pathname);
    if (target.hash && !targetBody.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`)) {
      failures.push(`${route}: missing anchor ${target.hash} in ${target.pathname}`);
    }
  }
}

const rootHtml = (await get('/')).body;
const canonical = rootHtml.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
assert.ok(canonical, 'Homepage needs an absolute canonical URL');
const projectPath = new URL(canonical).pathname;
for (const page of [['/', rootHtml], ['/guide.html', (await get('/guide.html')).body]]) {
  assert.match(page[1], /<title>[^<]+<\/title>/, `${page[0]} needs a title`);
  assert.match(page[1], /<meta name="description" content="[^"]+">/, `${page[0]} needs a description`);
  assert.match(page[1], /<meta name="robots" content="index, follow/, `${page[0]} needs an indexable robots directive`);
  const pageCanonical = page[1].match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(pageCanonical, `${page[0]} needs a canonical URL`);
  assert.ok(new URL(pageCanonical).pathname.startsWith(projectPath), `${page[0]} canonical is outside the site path`);
}
const robots = (await get('/robots.txt')).body;
const sitemapRef = robots.match(/^Sitemap:\s*(\S+)/mi)?.[1];
assert.ok(sitemapRef, 'robots.txt must list the sitemap');
assert.equal(new URL(sitemapRef).pathname, `${projectPath}sitemap.xml`, 'robots.txt must reference this site sitemap');
const sitemap = (await get('/sitemap.xml')).body;
let listedPageCount = 0;
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const listed = new URL(loc);
  assert.equal(listed.origin, new URL(canonical).origin);
  assert.ok(listed.pathname.startsWith(projectPath));
  await get(listed.pathname.slice(projectPath.length - 1) || '/');
  listedPageCount++;
}
assert.equal(listedPageCount, 2, 'Sitemap should include the landing and guide pages');

const schemas = [...rootHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, json]) => JSON.parse(json));
assert.ok(schemas.some((schema) => schema['@type'] === 'SoftwareApplication'), 'SoftwareApplication schema is required');
const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
assert.ok(faq, 'FAQPage schema is required');
for (const { name } of faq.mainEntity) assert.ok(rootHtml.includes(`<summary>${name}</summary>`), `FAQ schema does not match visible question: ${name}`);
const missing = await get('/audit-missing-route.html', 404);
assert.match(missing.body, /That page took/);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${responses.size} local routes/assets, internal anchors, sitemap URLs, structured data, and the custom 404 response.`);
}
