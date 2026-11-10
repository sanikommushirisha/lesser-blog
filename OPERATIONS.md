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
- **Content changes:** the prerendered HTML is baked at build time, so a Sanity
  publish alone changes nothing on the site. A Sanity webhook refreshes the
  affected post, the blog list and the sitemaps in seconds with no CI run or
  build, see "Sanity publish webhook" below. A full redeploy rebuilds everything.

## Sanity publish webhook

```
Sanity  --POST-->  https://lesser.tax/api/webhooks/sanity   (Lesser app, port 3002)
                     verifies the signature, then runs on the same server:
                   node blog/scripts/revalidate.mjs --slug=<slug> [--previous=<old>]
                     re-renders that post, the list page and sitemap.xml into blog/dist
```

The receiver lives in the `lesser` repo (`app/api/webhooks/sanity/route.ts`,
`lib/sanity/webhook.ts`); the renderer is here (`blog/scripts/revalidate.mjs`,
sharing `blog/scripts/lib/pages.mjs` with the full build, so the output is
identical). nginx already sends `/api/*` to the Lesser app.

**Server env (Lesser app, `.env.local` on the box):** `SANITY_WEBHOOK_SECRET`
(any long random string; the same value goes in Sanity) and `BLOG_ROOT` (absolute
path of this repo's `blog/` folder on the server). Restart the Lesser app's
process with `--update-env`.

**Sanity webhook** (manage.sanity.io, project `1mxaoto5`, API, Webhooks):

- URL: `https://lesser.tax/api/webhooks/sanity`
- Dataset: `production`. Trigger on: Create, Update, Delete.
- Filter: `_type == "post"`
- Projection: `{"type": _type, "slug": coalesce(slug.current, before().slug.current), "previousSlug": before().slug.current}`
- HTTP method: POST. Secret: the `SANITY_WEBHOOK_SECRET` value.
- Drafts: off (only published changes should refresh the site).

**Good to know**

- Needs a normal build on the server (`dist/` and `dist-server/`).
  `dist-server/template.html` is the pristine page shell the script renders into.
- Only the changed post, the list and the sitemaps are refreshed. The "more
  posts" strip on OTHER posts catches up on the next full deploy.
- Unpublish or delete removes the post's static page (it then 404s). A renamed
  slug removes the old page (uses `previousSlug`).
- If Sanity returns zero posts the script leaves the site untouched.
- Check delivery in Sanity (webhook, Attempts: expect 200). Server logs carry
  `[SANITY_WEBHOOK]` lines.
- By hand: `cd $BLOG_ROOT && node scripts/revalidate.mjs --slug=<slug>` (or
  `--all` for just the list and sitemaps).
- Search engines are not pinged by this refresh; the next full build submits to
  Bing/IndexNow as before.

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

## Email gate and lead magnets (added Nov 2026)

This ships switched off. Merging changes nothing a reader sees on articles.

- Gate on articles: `blog/src/components/EmailGate.tsx`, configured in
  `blog/src/lib/lead-magnets.ts`. It only appears on posts in `GATE_ROLLOUT`,
  which is empty.
- Signup: `POST /api/newsletter/subscribe` in `server/newsletter.ts`. The email
  service is not decided yet. Until it is configured the route answers 503.
- Lead magnet PDFs go in `blog/public/guides/` after tax review. `/blog/guides/*`
  is served `noindex`.

**Before turning it on:** decide the email service, get the PDFs signed off, then
add a small batch of post slugs to `GATE_ROLLOUT` and watch Search Console. Do
not add passport posts.

**Reading the test:** PostHog events `gate_shown` and `gate_subscribed` carry
`offer`, `topic` and `arm`. Compare `matched` with `general` inside each topic.

**Previewing the gate:** build with `VITE_GATE_PREVIEW=true`, then open any post
with `?gate=preview`.
