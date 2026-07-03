# Operations — blog.lesser.tax

Everything needed to run this blog without archaeology. Last verified: July 3, 2026.

## The stack, in one paragraph

Content lives in Sanity (project `1mxaoto5`, dataset `production`), edited at
blog.lesser.tax/studio. The site is a Vite + React SPA in `blog/`, deployed on
Vercel (team "lesser Tax", project `lesser-blog-`) and served at
blog.lesser.tax. At build time, `blog/scripts/prerender.mjs` fetches all
published posts and writes real HTML per post into `dist/<slug>/index.html`
plus `sitemap.xml` — this is what makes the content visible to Bing and AI
crawlers (PerplexityBot, GPTBot, ClaudeBot), which do not execute JavaScript.
Browsers hydrate the same HTML into the interactive app.

## Repos — history and current truth

- **Source of truth: `sanikommushirisha/lesser-blog` (public, this repo).**
- `sanikommushirisha/lesser-blog-` (private, trailing dash) is a STALE early
  copy — its main is stuck at "Initial commit". The Vercel project was
  originally git-connected to it, which meant later code changes here never
  reached production. It was disconnected on Jul 3, 2026 and should be
  archived. Never push to it.

## How deploys happen

- **Code changes:** merge to `main` → Vercel auto-deploys production
  (requires the Vercel GitHub App to have access to this repo; branches get
  preview deployments). Manual fallback: `npx vercel --prod` from a checkout
  (CLI auth: the `lessertax` Vercel account).
- **Content changes:** publishing/editing a post in Studio needs a REBUILD to
  reach crawlers (prerendered HTML is baked at build time). A Sanity webhook
  on post publish should hit a Vercel Deploy Hook (Vercel project → Settings →
  Git → Deploy Hooks; paste the URL into sanity.io/manage → project → API →
  Webhooks, filter `_type == "post"`). Until that webhook exists, trigger a
  redeploy manually after publishing.

## Build pipeline (vercel.json at repo root)

`cd blog && npm install && npm run build`, output `blog/dist`:

1. `tsc -b && vite build` — normal client build
2. `vite build --ssr src/entry-server.tsx --outDir dist-server` — server bundle
3. `node scripts/prerender.mjs` — fetches posts from Sanity, renders
   `/` + every `/<slug>` to static HTML with meta + JSON-LD + embedded
   `window.__INITIAL_DATA__`, writes `sitemap.xml`. Fails the build if Sanity
   returns zero posts (protects against publishing an empty site).

`robots.txt` is static in `blog/public/`. The SPA fallback rewrite plus
`trailingSlash: false` live in root `vercel.json`; prerendered files win over
the rewrite because Vercel checks the filesystem first.

## Environment variables (Vercel project settings)

- `VITE_SANITY_PROJECT_ID` = `1mxaoto5` (public identifier, baked into bundle)
- `VITE_SANITY_DATASET` = `production`

## Verifying a deploy did the right thing

```bash
# Bots must see full HTML, not a ~1KB shell:
curl -s -A "Mozilla/5.0 (compatible; PerplexityBot/1.0)" \
  https://blog.lesser.tax/<any-post-slug> | wc -c   # expect tens of KB
curl -s https://blog.lesser.tax/sitemap.xml | head  # expect XML, not HTML
```

## Rollback

Vercel dashboard → project → Deployments → previous READY deployment →
"Instant Rollback". Content problems roll back in Sanity (document history in
Studio), then redeploy.

## SEO/GEO wiring

- Google Search Console: property `https://blog.lesser.tax/` (URL-prefix).
  Sitemap submitted there; service account `claude-gsc-reader@dinesh-gsc-claude`
  has Full access for automated checks.
- Bing Webmaster Tools: site imported from GSC (Jul 2, 2026). Submit
  `sitemap.xml` there too — Bing's index feeds ChatGPT.
