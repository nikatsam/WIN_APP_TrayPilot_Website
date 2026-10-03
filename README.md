# TrayPilot Website

Static, dependency-free promotional site for the TrayPilot Windows 11 app. Intended for the public GitHub repository `WIN_APP_TrayPilot_Website` and GitHub Pages at `https://nikatsam.github.io/WIN_APP_TrayPilot_Website/`.

## Local preview

Open `index.html` directly in a browser, or serve this directory with any static file server. No build step, package installation, cookies, analytics, or runtime API is required. Google Fonts are an optional external font request; system font fallbacks are included.

Run `node scripts/validate-site.mjs` to check local references, image assets, metadata, structured data, visible FAQ content, sitemap, and robots directives. Run `node scripts/audit-http.mjs` while the preview server is running to request every local page, asset, and anchor over HTTP.

## Publish with GitHub Pages

1. Create a public repository named `WIN_APP_TrayPilot_Website` under `nikatsam`.
2. Add this directory's contents at the repository root.
3. In repository settings, open **Pages** and select **GitHub Actions** as the build and deployment source.
4. Wait for the Pages deployment, then check the public home page, `/robots.txt`, `/sitemap.xml`, image URLs, canonical URL, and Microsoft Store link.
5. In Google Search Console and Bing Webmaster Tools, verify the site and submit `https://nikatsam.github.io/WIN_APP_TrayPilot_Website/sitemap.xml`. Yandex Webmaster can also use the sitemap URL. These submissions are optional discovery tools, not indexing or ranking guarantees.

## Before publishing

- The Microsoft Store submission is pending certification as of the source project's release record. Confirm public Store availability and the final listing before representing the app as published.
- The source app repository is not currently publicly accessible. The site therefore uses its own Help page and does not link visitors to unavailable source or issue pages.
- Confirm the Store price, availability, Store deep link, screenshots, and feature descriptions against the live listing and certified build.
- Screenshots and the Store logo are copied from the TrayPilot app repository at build time. Keep these local assets in sync when UI changes.
- The canonical URL, sitemap, robots file, Open Graph image, and JSON-LD use the expected GitHub Pages project URL. Update every occurrence if the account or repository name changes.
- GitHub Pages project-site URLs are case-sensitive in paths; keep the repository spelling exactly `WIN_APP_TrayPilot_Website`.

## Search and sharing support

- Semantic, server-rendered HTML content and descriptive page title/description.
- Canonical URL, crawlable links, `robots.txt`, XML sitemap, and useful 404 page.
- Open Graph and X/Twitter card metadata with descriptive screenshot alt text.
- Schema.org `SoftwareApplication` and FAQ structured data matching visible copy.
- No fabricated ratings, reviews, testimonials, awards, or availability claims.
