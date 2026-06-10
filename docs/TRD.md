# TRD — Blog Page with Sanity CMS

**Companion to:** PRD.md
**Date:** June 10, 2026

---

## 1. Architecture overview

```
┌──────────────────┐     GROQ over HTTPS      ┌─────────────────────┐
│  Sanity Studio    │ ──── content ────────▶  │  Sanity Content Lake │
│  (/studio route   │                          │  (hosted, CDN-backed)│
│   or *.sanity.    │                          └─────────┬───────────┘
│   studio)         │                                    │
└──────────────────┘                          GROQ query │ + webhook on publish
        ▲                                                ▼
   non-tech editors                          ┌─────────────────────┐
                                             │  Next.js website     │
                                             │  /blog (listing)     │
                                             │  /blog/[slug] (post) │
                                             │  ISR + on-demand     │
                                             │  revalidation        │
                                             └─────────────────────┘
```

**Confirmed stack (June 10, 2026):** standalone **React 18 + Vite + TypeScript + Tailwind CSS** app deployed at `blog.lesser.tax` — same stack as the main lesser.tax site. Routes: `/` (listing), `/:slug` (post), `/studio` (embedded Sanity Studio).

**Rendering note (Vite SPA):** content is fetched client-side from Sanity's CDN (`useCdn: true`), so publishes appear live immediately with **no rebuild and no webhook needed** — even simpler than the ISR flow. SEO/social unfurls are handled via `react-helmet-async` meta tags plus a build-time `sitemap.xml` generation script; if organic-search performance on article pages becomes a priority later, the upgrade path is prerendering (`vite-react-ssg`) triggered by a Sanity webhook → host build hook.

## 2. Key decisions

| Decision | Choice | Why |
|---|---|---|
| Rendering | **ISR (static) + on-demand revalidation via Sanity webhook** | Fast pages, survives Sanity outages, publishes live in seconds without redeploys (PRD F4) |
| Content query | GROQ via `next-sanity` client, `useCdn: true` for published content | CDN-cached reads, free-tier friendly |
| Rich text | Portable Text rendered with `@portabletext/react` + custom components | Structured content, not raw HTML — safe and stylable |
| Images | `@sanity/image-url` + `next/image` | Auto WebP/AVIF, responsive srcset, LCP-friendly |
| Studio hosting | Embedded at `/studio` route in the same Next.js app | One repo, one deploy, teammates get a stable URL |
| Draft preview | Next.js Draft Mode + Sanity Presentation tool | Live click-to-edit preview for editors |

## 3. Sanity schema design

Dataset: `production`. Three document types + one object.

### `post`
| Field | Type | Validation |
|---|---|---|
| `title` | string | required, max 120 |
| `slug` | slug (source: title) | required, unique |
| `excerpt` | text | required, max 200 — used on cards + meta description fallback |
| `mainImage` | image (hotspot on) + `alt` string | required, alt required |
| `category` | reference → `category` | required |
| `author` | reference → `author` | required |
| `publishedAt` | datetime | required, default now |
| `body` | array (Portable Text: blocks, image w/ alt + caption, code) | required |
| `seo` | object `seo` | optional |

### `author`
`name` (string, req) · `avatar` (image, req) · `role` (string) · `bio` (text)

### `category`
`title` (string, req) · `slug` (slug, req)

### `seo` (object)
`metaTitle` (string, max 60) · `metaDescription` (text, max 160) · `ogImage` (image)
Fallbacks in code: `metaTitle → title`, `metaDescription → excerpt`, `ogImage → mainImage`.

**Read time:** computed at render: `Math.ceil(words(body) / 200)` — not stored, can't go stale.

## 4. Routes & data flow

| Route | Type | Data |
|---|---|---|
| `/blog` | ISR, `revalidate: 3600` + webhook | `*[_type=="post" && defined(slug.current)] \| order(publishedAt desc){ title, slug, excerpt, mainImage, publishedAt, category->{title}, author->{name, avatar}, "wordCount": length(pt::text(body)) }` |
| `/blog/[slug]` | ISR + `generateStaticParams` | full post by slug, body included |
| `/studio/[[...tool]]` | client-side Studio | — |
| `/api/revalidate` | POST webhook target | validates `sanity-webhook-signature`, calls `revalidatePath('/blog')` + `revalidatePath('/blog/' + slug)` |
| `/api/draft` | GET | enables Next.js Draft Mode for Studio preview |
| `/sitemap.xml` | generated | all post slugs + lastmod |

**Publish flow:** Editor hits Publish in Studio → Content Lake updates → Sanity webhook (filter: `_type == "post"`) fires → `/api/revalidate` verifies HMAC signature → affected paths revalidate → live in <10s.

## 5. Project structure (new files)

```
sanity/
  schemas/post.ts, author.ts, category.ts, seo.ts, index.ts
  lib/client.ts        # next-sanity client
  lib/queries.ts       # GROQ queries
  lib/image.ts         # urlFor() builder
  env.ts               # projectId/dataset from env
sanity.config.ts
app/
  blog/page.tsx                 # listing
  blog/[slug]/page.tsx          # post detail
  studio/[[...tool]]/page.tsx   # embedded Studio
  api/revalidate/route.ts
  api/draft/route.ts
components/blog/
  PostCard.tsx, PostBody.tsx (PortableText components),
  AuthorChip.tsx, CategoryTag.tsx
```

## 6. Environment & config

```
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...        # server-only, for draft preview
SANITY_REVALIDATE_SECRET=...     # webhook HMAC secret
```

Dependencies: `next-sanity`, `@sanity/image-url`, `@portabletext/react`, `sanity`, `styled-components` (Studio peer dep).

## 7. SEO & metadata

- `generateMetadata()` per post: title, description, canonical, OG/Twitter cards.
- JSON-LD `Article` (headline, image, datePublished, author) injected in post page.
- `next/image` with `priority` on the post hero (LCP).

## 8. Security

- Studio access via Sanity project members only (invite by email, Google SSO); roles: Editor for teammates, Administrator for dev.
- Read token & revalidate secret server-side only.
- Webhook endpoint rejects requests with invalid `sanity-webhook-signature` (HMAC-SHA256).
- CORS origin on Sanity project restricted to site domain + localhost.

## 9. Failure modes

| Failure | Behavior |
|---|---|
| Sanity API down | ISR serves last-built static pages; no visitor impact |
| Webhook missed | Hourly `revalidate: 3600` catches up |
| Missing required field | Studio validation blocks publish |
| Broken image | required-alt validation + fallback gradient block |

## 10. Implementation plan & estimates

| Phase | Work | Est. |
|---|---|---|
| 1 | Sanity project setup, schemas, embedded Studio | 0.5 day |
| 2 | Listing + post pages, Portable Text renderer, styling per design spec | 1–1.5 days |
| 3 | Webhook revalidation, draft preview, SEO/sitemap/JSON-LD | 0.5–1 day |
| 4 | QA (Lighthouse, mobile, a11y), seed 2–3 sample posts, editor walkthrough doc | 0.5 day |

**Total: ~3–3.5 dev days.**

## 11. Testing

- Unit: GROQ query shape (typed via `sanity-typegen` optional), read-time calc.
- Integration: publish in Studio → assert page revalidates (staging dataset).
- Manual: editor dry run by an actual non-tech teammate before launch.
