# Lesser marketing site and blog: Claude Code notes

Marketing site (`client/`, React + Vite + wouter, served by Express in `server/`) and the blog (`blog/`, its own Vite app, prerendered from Sanity). The Lesser app itself lives in the separate `lesser` repo and is reached at `/app` (nginx in production, `server/dev-app-proxy.ts` in development). Operations and deploy details: `OPERATIONS.md`.

Copy rules match the app's: no em-dash (`—`) in any user-facing text, including titles and meta descriptions.

---

## SEO: required on every page you touch

Standing rule, not a one-off: whenever you create a page OR work on an existing one, check its SEO and fix whatever falls short in the same change, even if the task was about something else. Say in your report what you checked and changed.

### Checklist

1. **Meta title**: unique per page, 50-60 characters, main search phrase first, ending `| Lesser Tax` (the brand is "Lesser Tax", never "Lesser" alone). Written for people searching (e.g. "Indian Passport Renewal in the USA for NRIs | Lesser Tax"), not internal names.
2. **Meta description**: unique, 140-160 characters, says what the page offers and who it is for, includes the main phrase once, ends with a reason to click. No keyword stuffing.
3. **Canonical**: absolute URL of the page itself, never the home page, plus matching `og:url`, `og:title`, `og:description`, `og:image` and `twitter:*`.
4. **Headings**: exactly one `h1` that states the page topic; then `h2` for sections and `h3` inside them, never skipping a level. Never pick a heading tag for its size: style it with classes.
5. **Internal links**: link related pages from the body copy with descriptive anchor text ("file your India tax return", not "click here"), using real `<a href>` so crawlers can follow them. Every new page should be linked from at least one existing page (navbar, footer or body) and link out to 2-5 related ones: `/nris`, `/services/passport-renewal`, `/services/india-tax-filing`, `/business`, `/marketplace`, `/dashboard/tax-experts`, `/blog` and relevant blog posts.
6. **Structured data** where it fits: JSON-LD (`Service`, `FAQPage`, `BreadcrumbList`, `Article`). Only describe what is on the page; no invented ratings or reviews.
7. **Indexing**: `sitemap.xml` is generated at build time from `shared/page-meta.ts` (every entry without `robots`), with `lastmod` from git; images get meaningful `alt` text (`alt=""` only for decorative ones), and large images are WebP at display size with `width`/`height`.

### How meta and rendering work on this site (read before changing it)

**One table, `shared/page-meta.ts`.** Every route's title, description, canonical, OG/Twitter tags, `robots` and route-level JSON-LD (Organization, WebSite, Service, BreadcrumbList) live in `PAGE_META`. Pages do not set meta themselves (no `react-helmet`, no per-page `usePageMeta`): `<RouteMeta />` in `App.tsx` updates `<head>` from the same table on in-app navigation. Page-level JSON-LD that mirrors visible content (FAQs) is rendered by the page with `<FaqJsonLd>` from `components/json-ld.tsx`.

**Marketing pages are prerendered.** `npm run build` also builds `client/src/entry-server.tsx` for SSR and `script/prerender.ts` renders every `PAGE_META` route to `dist/prerendered/<route>.html` with its meta, so crawlers that do not run JavaScript (Bing, GPTBot, PerplexityBot, ClaudeBot) get the full page. The browser hydrates it (`main.tsx`). Consequences:

- A page's first render must be the same on the server and in the browser: no `window`, `localStorage`, `Date.now()` or random values during render; read them in `useEffect`.
- Pages are lazy chunks (`client/src/routes.tsx`). Add a new route there AND in `PAGE_META`; the build fails if a route has no entry, if a title or description is out of range, if a canonical is wrong or if there is an em-dash.
- Hero content should be visible without JavaScript. Use CSS entrance animations (`hero-fade-up`, `hero-text-reveal`, which start at opacity 0.01, not 0), not state set in an effect, or the Largest Contentful Paint waits for hydration.

**Serving (`server/static.ts`).** Known routes get their prerendered file (from memory); `/nris/` 301s to `/nris`; unknown paths get the prerendered 404 page with a real **404 status** and `noindex`. It also sets gzip/brotli (`compression`), a 1-year immutable cache on hashed `/assets/*`, HSTS and security headers. Check locally after `npm run build`: `NODE_ENV=production PORT=5055 node dist/index.cjs`, then `curl -s localhost:5055/<route> | grep -E '<title>|canonical|<h1'`.

The blog (`blog/`) prerenders real HTML per post and handles its own meta and sitemaps; follow the same checklist there.

### Blog specifics

Blog titles go through `pageTitle()` and descriptions through `pageDescription()` (`blog/src/lib/seo.ts`): "| Lesser Tax" when it fits in 60 characters, descriptions cut to 160, em-dashes removed. React 19 renders `<title>`/`<meta>`/`<link>` at the start of the app markup; `blog/scripts/prerender.mjs` moves them into `<head>` (a canonical or description in `<body>` is ignored by Google). Each article links to the matching service page through `ServiceLink`/`ServiceCard` (`blog/src/components/ServiceCta.tsx`), chosen from the slug. Never group modules into a manual "studio" chunk in `blog/vite.config.ts`: it made every article preload the 6.5 MB Sanity Studio bundle.
