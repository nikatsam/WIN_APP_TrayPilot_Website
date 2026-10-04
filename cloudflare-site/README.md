# TrayPilot Light Site

A second, light-theme product presentation for TrayPilot. This static site is self-contained in this directory and is deployed separately at [traypilot-light-site.pages.dev](https://traypilot-light-site.pages.dev/).

## Local preview

Run `node scripts/serve-site.mjs`, then open `http://127.0.0.1:4183/`. Run `node scripts/audit-site.mjs` while the local preview server is running. No app installation, build step, or package dependencies are required. Google Fonts are optional; the CSS includes system fallbacks.

## Search indexing

Canonical URLs, Open Graph images, `robots.txt`, and `sitemap.xml` target `https://traypilot-light-site.pages.dev/`. Submit `https://traypilot-light-site.pages.dev/sitemap.xml` in Google Search Console, Bing Webmaster Tools, and optionally Yandex Webmaster. Indexing and ranking are controlled by search engines and are not guaranteed.

## Cloudflare Pages

This directory is the Cloudflare Pages project root. `wrangler.toml` sets the project name and output directory; no build command is needed. Deployments are triggered by a protected workflow in the private deployment repository. The Cloudflare API token is not stored in this public source repository.

The Microsoft Store submission may still be pending certification. The site links to the product listing without claiming that certification or public availability is complete.
