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

## Email gate, lead magnets and free tools (added Nov 2026)

Everything below ships switched off. Merging changes nothing a reader sees on
articles, and the tool pages stay `noindex` with a draft banner.

**Pieces**

- Gate on articles: `blog/src/components/EmailGate.tsx`, configured in
  `blog/src/lib/lead-magnets.ts`.
- Signup: `POST /api/newsletter/subscribe` in `server/newsletter.ts`. Adds the
  reader to a Resend segment and emails the PDF.
- Free tools: static pages in `blog/public/tools/`. Tax rules are in
  `tools-logic.js`, and every figure comes from a published post.

**Server setup**

Add to the `lesser-blog` PM2 environment, then restart:

- `RESEND_API_KEY`
- `RESEND_NEWSLETTER_SEGMENT_ID`
- `NEWSLETTER_FROM`, for example `Lesser Tax <news@news.lesser.tax>`

Without them the route answers 503 and the gate lets readers through. Use a
separate sending subdomain so newsletter complaints do not affect app email.
Before launch, send one real test and check: a repeat signup for an existing
contact (the code accepts 409, Resend's actual response is unconfirmed), and
an unsubscribe route for the welcome email, which today says to reply
"unsubscribe".

**Going live, in order**

1. Tax team signs off each PDF. Add it to `blog/public/guides/` with the file
   name in `shared/lead-magnets.ts`. `/blog/guides/*` is served `noindex`.
2. Add a small batch of post slugs to `GATE_ROLLOUT`. Watch Search Console
   before adding more. Do not add passport posts.
3. For each approved tool: remove its `noindex` meta and draft banner, add it to
   `PUBLISHED_TOOLS` in `blog/scripts/prerender.mjs`, and add a "Free tools" link
   to `blog/src/components/Footer.tsx`.

**Reading the test**

PostHog events `gate_shown` and `gate_subscribed` carry `offer`, `topic` and
`arm`. Compare `matched` with `general` inside each topic. Tools send
`tool_used` and `tool_subscribed`. No figures typed into a tool are sent, and
session replay is off on those pages.

**Previewing the gate:** build with `VITE_GATE_PREVIEW=true`, then open any post
with `?gate=preview`.
