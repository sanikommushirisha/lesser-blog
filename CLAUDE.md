# Lesser marketing site and blog: Claude Code notes

Marketing site (`client/`, React + Vite + wouter, served by Express in `server/`) and the blog (`blog/`, its own Vite app, prerendered from Sanity). The Lesser app itself lives in the separate `lesser` repo and is reached at `/app` (nginx in production, `server/dev-app-proxy.ts` in development). Operations and deploy details: `OPERATIONS.md`.

Copy rules match the app's: no em-dash (`—`) in any user-facing text, including titles and meta descriptions.

---

## SEO: required on every page you touch

Standing rule, not a one-off: whenever you create a page OR work on an existing one, check its SEO and fix whatever falls short in the same change, even if the task was about something else. Say in your report what you checked and changed.

### Checklist

1. **Meta title**: unique per page, 50-60 characters, main search phrase first, ending `| Lesser`. Written for people searching (e.g. "Indian Passport Renewal in the US | Lesser"), not internal names.
2. **Meta description**: unique, 140-160 characters, says what the page offers and who it is for, includes the main phrase once, ends with a reason to click. No keyword stuffing.
3. **Canonical**: absolute URL of the page itself, never the home page, plus matching `og:url`, `og:title`, `og:description`, `og:image` and `twitter:*`.
4. **Headings**: exactly one `h1` that states the page topic; then `h2` for sections and `h3` inside them, never skipping a level. Never pick a heading tag for its size: style it with classes.
5. **Internal links**: link related pages from the body copy with descriptive anchor text ("file your India tax return", not "click here"), using real `<a href>` so crawlers can follow them. Every new page should be linked from at least one existing page (navbar, footer or body) and link out to 2-5 related ones: `/nris`, `/services/passport-renewal`, `/services/india-tax-filing`, `/business`, `/marketplace`, `/dashboard/tax-experts`, `/blog` and relevant blog posts.
6. **Structured data** where it fits: JSON-LD (`Service`, `FAQPage`, `BreadcrumbList`, `Article`). Only describe what is on the page; no invented ratings or reviews.
7. **Indexing**: add the URL to `client/public/sitemap.xml`; images get meaningful `alt` text (`alt=""` only for decorative ones).

### How meta works on this site (read before changing it)

The site is a client-rendered SPA, so crawlers' first HTML response is `client/index.html` with the route's meta swapped in by the server. A page's meta therefore lives in **two places, kept identical**:

1. **`PAGE_META` in `server/static.ts`**: what crawlers and link previews get. `injectMeta` writes the title, description, canonical, OG/Twitter tags and any `jsonLd` blocks into the HTML. It runs in production (`serveStatic`) and in development (`server/vite.ts`), so check it locally with `curl -s localhost:5000/<route> | grep -E '<title>|canonical|description'`. **A route with no entry gets the home page's meta, including `canonical: https://lesser.tax/`**, which tells Google the page is a duplicate of the home page. Every public route needs an entry.
2. **`usePageMeta()` from `client/src/lib/seo.ts`**, called in the page component: updates the same tags when the user arrives by in-app navigation. Prefer it to `react-helmet` for new pages. Helmet appends its own tags next to the server-injected ones, which leaves duplicate canonicals and descriptions (older pages still use Helmet; move them over when you work on them).

`metaFor()` must be given `req.originalUrl`, not `req.path`: inside `app.use("/{*path}")` Express 5 strips the mount path, so `req.path` is always `/` there. That bug served the home page's meta on every route until 2026-10-12.

The blog (`blog/`) prerenders real HTML per post and handles its own meta and sitemaps; follow the same checklist there.

### Known gaps (as of 2026-10-12)

These sitemap pages have no `PAGE_META` entry, so crawlers see the home page's title and canonical: `/services/india-tax-filing`, `/services/passport-renewal`, `/offers/google`, `/offers/infosys`, `/privacy`, `/terms`. Fix one whenever you touch it, or all at once.
