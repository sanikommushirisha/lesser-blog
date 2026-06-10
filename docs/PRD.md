# PRD — Blog Page with Sanity CMS

**Product:** Blog section for company website
**Reference design:** https://blog.rally.tax/t/blogs
**Date:** June 10, 2026
**Status:** Draft for review

---

## 1. Problem & Goal

The website currently has no blog. Marketing/content teammates (non-technical) have no way to publish articles without asking a developer. We need:

1. A public blog listing page + individual article pages, visually matching the Rally Tax blog reference.
2. A no-code publishing workflow via **Sanity** (headless CMS) so any teammate can write, preview, and publish posts through Sanity Studio.

## 2. Users

| User | Need |
|---|---|
| Site visitor / prospect | Read articles, discover related content, share links |
| Content teammate (non-tech) | Create/edit/publish posts with a Google-Docs-like editor, upload images, no code |
| Marketing lead | Control categories, authors, SEO metadata; see drafts before publish |
| Developer | Maintain zero-touch pipeline — publishing requires no deploys |

## 3. Scope

### In scope (v1)
- **Blog listing page** (`/blog`): single-column feed of post cards — featured image, category tag, title, date + read time, author avatar + name (per reference).
- **Post detail page** (`/blog/[slug]`): hero image, title, author block, date, read time, rich body (headings, images, quotes, code, lists, embedded links), category tag.
- **Sanity Studio** hosted at `/studio` (or `*.sanity.studio`) with schemas for Post, Author, Category.
- **Draft → Publish workflow**: teammates save drafts; publishing makes the post live on the site within ~60 seconds without a developer.
- **Live preview** of drafts before publishing.
- **SEO**: per-post meta title/description, OG image, canonical URL, sitemap entries, JSON-LD Article schema.
- **Auto-calculated read time** from body length.
- Responsive (mobile-first), accessible (WCAG AA).

### Out of scope (v1) — candidates for v2
- Comments, likes/reactions
- Newsletter signup integration
- Full-text search
- Category filter tabs / pagination (reference page has neither; add when post count > ~20)
- Multi-language content
- RSS feed (cheap to add — confirm if wanted)

## 4. User stories

1. As a content teammate, I log into Sanity Studio, click "New Post," write with a rich-text editor, drag in images, pick an author and category, and hit Publish — the post appears on the site within a minute.
2. As a content teammate, I can preview exactly how my draft will look on the real site before publishing.
3. As a visitor, I open `/blog` and scan a clean feed of articles; clicking one opens a fast, readable article page.
4. As a marketing lead, I can unpublish or edit a live post and the site updates without engineering help.
5. As a visitor sharing a post on LinkedIn/X, the link unfurls with the right image and title.

## 5. Functional requirements

| # | Requirement | Priority |
|---|---|---|
| F1 | Listing page renders all published posts, newest first | P0 |
| F2 | Post page renders full rich-text body from Sanity (Portable Text) | P0 |
| F3 | Studio roles: Editor (write/publish), Viewer | P0 |
| F4 | Publish/edit/unpublish reflects on site ≤ 60s, no deploy | P0 |
| F5 | Slug auto-generated from title, editable, uniqueness enforced | P0 |
| F6 | Required fields validated in Studio (title, slug, image, author, body) | P0 |
| F7 | Draft preview from Studio | P1 |
| F8 | Read-time auto-calculation | P1 |
| F9 | SEO fields with sensible fallbacks (meta = title/excerpt if blank) | P1 |
| F10 | Image optimization (responsive sizes, lazy load, WebP/AVIF via Sanity CDN) | P1 |

## 6. Non-functional requirements

- **Performance:** Lighthouse ≥ 90 (Performance/SEO/A11y); LCP < 2.5s on 4G.
- **Reliability:** Site stays up even if Sanity API is down (cached/static pages).
- **Cost:** Sanity free tier (3 users, 2 datasets) is sufficient for v1; note upgrade trigger at >3 editors.
- **Security:** Studio behind Sanity auth (Google SSO); read token never exposed client-side for drafts.

## 7. Success metrics

- Time-to-publish for a non-tech teammate: < 15 min from idea to live, zero dev involvement.
- 100% of posts published without engineering tickets after launch week.
- Organic traffic to `/blog/*` (baseline → +X% in 90 days, target set by marketing).

## 8. Decisions (confirmed June 10, 2026)

- **Stack:** Main site (lesser.tax) is React + Vite + Tailwind. Blog is a standalone React + Vite + Tailwind app — same stack, so any teammate developer can maintain it.
- **URL:** `blog.lesser.tax` (subdomain). Blog listing lives at the subdomain root `/`, posts at `/:slug`.
- **Editors:** 3 members — fits Sanity free tier exactly.
- **Design:** Replicate lesser.tax design system exactly — Roboto, brand blue `#1C41F7`, shadcn-style HSL tokens (see UI-UX-DESIGN.md §2).
