import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const errors = [];

for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const url = match[1];
  if (url.startsWith('#') || /^(https?:|mailto:|data:|javascript:)/i.test(url)) continue;
  const file = path.resolve(root, decodeURIComponent(url.split(/[?#]/)[0] || '.'));
  try {
    await access(file);
  } catch {
    errors.push(`Missing local reference: ${url}`);
  }
}

const structuredData = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert.ok(structuredData.length >= 2, 'Expected application and FAQ structured data');
const schemas = structuredData.map(([, json]) => JSON.parse(json));
const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
assert.ok(faq, 'FAQPage schema is required');
for (const { name } of faq.mainEntity) {
  assert.ok(html.includes(`<summary>${name}</summary>`), `FAQ schema question is not visible: ${name}`);
}

for (const required of [
  '<title>',
  'name="description"',
  'rel="canonical"',
  'property="og:image"',
  'applicationCategory',
  '9N4VVRMPPK6W',
]) {
  assert.ok(html.includes(required), `Missing SEO metadata: ${required}`);
}

const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
assert.ok(canonical, 'Canonical URL is required');
assert.ok(sitemap.includes(`<loc>${canonical[1]}</loc>`), 'Sitemap URL must match canonical URL');
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
assert.ok(robots.includes('Sitemap: https://nikatsam.github.io/WIN_APP_TrayPilot_Website/sitemap.xml'));

for (const file of ['404.html', '.nojekyll', 'assets/store-logo.png', 'assets/screenshot-dashboard.png', 'assets/screenshot-shortcut.png']) {
  try {
    await access(path.join(root, file));
  } catch {
    errors.push(`Missing required site file: ${file}`);
  }
}

assert.deepEqual(errors, [], errors.join('\n'));
console.log('PASS: local references, assets, metadata, JSON-LD, visible FAQs, sitemap, and robots directives.');
