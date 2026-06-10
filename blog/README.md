# Lesser Blog — blog.lesser.tax

React + Vite + Tailwind blog powered by Sanity CMS. Matches the lesser.tax design system (Roboto, brand blue `#1C41F7`, shadcn-style HSL tokens).

## Routes

| Route | What |
|---|---|
| `/` | Blog listing (newest first) |
| `/:slug` | Article page |
| `/studio` | Embedded Sanity Studio — where teammates write & publish |

## One-time setup (~10 minutes)

1. **Create the Sanity project** (free):
   - Go to https://www.sanity.io/manage → Create project → name it "Lesser Blog", dataset `production`.
   - Copy the **Project ID**.
2. **Configure env:** copy `.env.example` to `.env` and set `VITE_SANITY_PROJECT_ID`.
3. **Allow the app's origins (CORS):** in sanity.io/manage → project → API → CORS origins, add:
   - `http://localhost:5173` (allow credentials ✓ — needed for Studio login)
   - `https://blog.lesser.tax` (allow credentials ✓)
4. **Invite your 3 teammates:** project → Members → invite by email with role **Editor**. They log into `/studio` with Google.
5. **Run locally:** `npm install && npm run dev` → http://localhost:5173 (site) and http://localhost:5173/studio (CMS).
6. **Seed content:** in Studio create 1 Category (e.g. "Tax Strategy"), 1 Author, then your first Post.

## Deploy (Vercel)

1. Import this folder as a Vercel project (`vercel.json` already handles SPA rewrites).
2. Add env vars `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET=production`.
3. Add custom domain `blog.lesser.tax` and create the CNAME record at your DNS provider.

Publishing in Studio is live on the site immediately — content is fetched from Sanity's CDN at page load, no rebuild needed.

## How teammates publish (the 3-step flow)

1. Open `blog.lesser.tax/studio`, log in.
2. Posts → ➕ New Post → fill Title, Excerpt, Featured image, Category, Author, Body. The form blocks publishing until required fields are filled.
3. Click **Publish**. Done — it's live.

## Project structure

```
sanity/schemas/      Post, Author, Category, SEO schemas
sanity.config.ts     Studio config (mounted at /studio)
src/lib/sanity.ts    Sanity client, GROQ queries, image builder, read-time
src/pages/           BlogList, BlogPost, StudioPage (lazy-loaded)
src/components/      Nav, Footer, PostCard, skeletons
src/index.css        lesser.tax design tokens (light + dark)
```
