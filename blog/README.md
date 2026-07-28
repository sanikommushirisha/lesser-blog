# Lesser Blog — served at lesser.tax/blog

React + Vite + Tailwind blog powered by Sanity CMS. Matches the lesser.tax design system (Roboto, brand blue `#1C41F7`, shadcn-style HSL tokens).

This was a standalone site on `blog.lesser.tax`. It is now a **sub-app of the
main lesser.tax site**: it keeps its own `package.json`, its own dependency tree
(React 19 / Tailwind 4 / Vite 8, versus React 18 / Tailwind 3 / Vite 7 in the
marketing app) and its own build, and the repo's Express server mounts the built
output at `/blog`. Neither app's dependencies can break the other's.

Everything *inside* this app stays basename-relative — router paths,
`InitialData.route`, the routes `scripts/prerender.mjs` renders. The `/blog`
prefix is applied in exactly three places: Vite's `base`, the routers' `basename`
(client in `src/main.tsx`, SSR in `src/entry-server.tsx` — they must match or
prerendered links come out wrong), and `src/lib/base.ts` for asset paths and
absolute URLs.

## Routes

| Route | What |
|---|---|
| `/blog` | Blog listing (newest first) |
| `/blog/:slug` | Article page |
| `/blog/videos/:slug` | Video watch page |
| `/blog/r/:combo` | Personalized renewal share page (noindex) |
| `/blog/studio` | Embedded Sanity Studio — where teammates write & publish |

## Before this goes live: add the CORS origin

Posts are fetched from Sanity **in the browser** on client-side navigation, so
Sanity has to allow the origin the blog is served from. It currently allows
`https://blog.lesser.tax`, which is no longer the origin. In sanity.io/manage →
project `1mxaoto5` → API → CORS origins, add:

- `https://lesser.tax` (allow credentials ✓ — needed for Studio login)
- whatever origin staging/preview deploys use

Prerendered pages still render their content without this (the HTML ships with
the post baked in), but clicking between pages will show
"Couldn't load articles right now" until it is added.

## One-time setup (~10 minutes)

1. **Create the Sanity project** (free):
   - Go to https://www.sanity.io/manage → Create project → name it "Lesser Blog", dataset `production`.
   - Copy the **Project ID**.
2. **Configure env:** copy `.env.example` to `.env` and set `VITE_SANITY_PROJECT_ID`.
3. **Allow the app's origins (CORS):** in sanity.io/manage → project → API → CORS origins, add:
   - `http://localhost:5173` (allow credentials ✓ — needed for Studio login)
   - `https://lesser.tax` (allow credentials ✓)
4. **Invite your 3 teammates:** project → Members → invite by email with role **Editor**. They log into `/blog/studio` with Google.
5. **Run locally:** from the repo root, `npm run dev:blog` → http://localhost:5173/blog (site) and http://localhost:5173/blog/studio (CMS).
6. **Seed content:** in Studio create 1 Category (e.g. "Tax Strategy"), 1 Author, then your first Post.

## Build & deploy

The blog is built and deployed by the parent repo, not on its own. From the root:

```
npm run build       # marketing + server + blog (this app, incl. prerender)
npm run build:blog  # just this app -> dist/public/blog
npm run dev:blog    # this app with HMR at localhost:5173/blog
```

`npm run build` here runs `tsc -b && vite build && npm run prerender`. The
prerender step needs `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET` and
network access to Sanity — it refuses to emit an empty site if the fetch returns
no posts, so a build will fail loudly rather than silently ship a blank blog.

It also submits the URL set to Bing + IndexNow, but **only on a deploy build**
(`VERCEL` / `CI` set, or `SUBMIT_URLS=1`), so local builds don't announce URLs.
Note Bing Webmaster Tools is verified for `blog.lesser.tax`; submissions for
`lesser.tax/blog` need that property verified too or they will be rejected.

`vercel.json` in this folder only applies if the blog is ever deployed
standalone on its own domain again.

Publishing in Studio is live on the site immediately — content is fetched from Sanity's CDN at page load, no rebuild needed. New posts appear in prerendered HTML and the sitemap on the next deploy build.

## How teammates publish (the 3-step flow)

1. Open `lesser.tax/blog/studio`, log in.
2. Posts → ➕ New Post → fill Title, Excerpt, Featured image, Category, Author, Body. The form blocks publishing until required fields are filled.
3. Click **Publish**. Done — it's live.

## Project structure

```
sanity/schemas/      Post, Author, Category, SEO schemas
sanity.config.ts     Studio config (mounted at /blog/studio)
scripts/prerender.mjs  Build-time HTML + sitemaps for every route
src/entry-server.tsx   SSR entry used by the prerender step
src/lib/base.ts      /blog mount: BASE_PATH, route<->URL helpers, asset()
src/lib/sanity.ts    Sanity client, GROQ queries, image builder, read-time
src/lib/initial-data.ts  Prerendered data handoff to the client
src/pages/           BlogList, BlogPost, WatchPage, RenewalWatchPage, StudioPage
src/motion/          Remotion compositions, players, watch-page widgets
src/components/      Nav, Footer, PostCard, skeletons
src/index.css        lesser.tax design tokens (light + dark)
```
